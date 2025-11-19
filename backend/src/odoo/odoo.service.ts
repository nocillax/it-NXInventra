import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inventory } from '../database/entities/inventory.entity';
import * as xmlrpc from 'xmlrpc';

@Injectable()
export class OdooService {
  private readonly url: string;
  private readonly db: string;
  private readonly username: string;
  private readonly password: string;

  constructor(private configService: ConfigService) {
    this.url = this.configService.get<string>(
      'ODOO_URL',
      'https://nxinventra1.odoo.com',
    );
    this.db = this.configService.get<string>('ODOO_DB', 'nxinventra1');
    this.username = this.configService.get<string>('ODOO_USERNAME', '');
    this.password = this.configService.get<string>('ODOO_PASSWORD', '');
  }

  async authenticate(): Promise<number> {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: this.url.replace('https://', ''),
        port: 443,
        path: '/xmlrpc/2/common',
      });

      client.methodCall(
        'authenticate',
        [this.db, this.username, this.password, {}],
        (error, uid) => {
          if (error) reject(error);
          else resolve(uid);
        },
      );
    });
  }

  async createRecord(model: string, values: any, uid: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: this.url.replace('https://', ''),
        port: 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall(
        'execute_kw',
        [this.db, uid, this.password, model, 'create', [values]],
        (error, id) => {
          if (error) reject(error);
          else resolve(id);
        },
      );
    });
  }

  async searchRecords(
    model: string,
    domain: any[],
    uid: number,
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: this.url.replace('https://', ''),
        port: 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall(
        'execute_kw',
        [this.db, uid, this.password, model, 'search_read', [domain]],
        (error, records) => {
          if (error) reject(error);
          else resolve(records);
        },
      );
    });
  }

  async updateRecord(
    model: string,
    id: number,
    values: any,
    uid: number,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: this.url.replace('https://', ''),
        port: 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall(
        'execute_kw',
        [this.db, uid, this.password, model, 'write', [[id], values]],
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
    });
  }

  async deleteRecord(model: string, id: number, uid: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: this.url.replace('https://', ''),
        port: 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall(
        'execute_kw',
        [this.db, uid, this.password, model, 'unlink', [[id]]],
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
    });
  }

  async syncInventoryToOdoo(
    inventory: Inventory,
    aggregatedData: any,
  ): Promise<void> {
    try {
      const uid = await this.authenticate();

      // Check if inventory already exists by API token
      const existingInventory = await this.searchRecords(
        'x_inventory',
        [['x_studio_api_token', '=', inventory.apiToken]],
        uid,
      );

      let inventoryId: number;

      if (existingInventory && existingInventory.length > 0) {
        // Update existing inventory
        inventoryId = existingInventory[0].id;
        await this.updateRecord(
          'x_inventory',
          inventoryId,
          {
            x_studio_name: inventory.title,
            x_studio_api_token: inventory.apiToken,
          },
          uid,
        );

        // Delete existing fields for this inventory before creating new ones
        const existingFields = await this.searchRecords(
          'x_field',
          [['x_studio_inventory_id_1', '=', inventoryId]],
          uid,
        );
        for (const field of existingFields) {
          await this.deleteRecord('x_field', field.id, uid);
        }
      } else {
        // Create new inventory
        const inventoryValues = {
          x_studio_name: inventory.title,
          x_studio_api_token: inventory.apiToken,
        };
        inventoryId = await this.createRecord(
          'x_inventory',
          inventoryValues,
          uid,
        );
      }

      // Create field records
      for (const field of aggregatedData.fields) {
        const fieldValues = {
          x_studio_inventory_id_1: inventoryId,
          x_studio_name: field.title,
          x_studio_field_type: field.type,
          // Add aggregation fields if they exist in Odoo model
          ...(field.type === 'number' &&
            field.aggregations && {
              x_studio_avg_value: field.aggregations.avg,
              x_studio_min_value: field.aggregations.min,
              x_studio_max_value: field.aggregations.max,
            }),
        };
        await this.createRecord('x_field', fieldValues, uid);
      }
    } catch (error) {
      throw new Error(`Odoo sync failed: ${error.message}`);
    }
  }
}

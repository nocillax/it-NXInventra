import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';

@Injectable()
export class SupportService {
  private dbx: Dropbox;

  constructor(private configService: ConfigService) {
    this.dbx = new Dropbox({
      accessToken: this.configService.get<string>('DROPBOX_ACCESS_TOKEN'),
    });
  }

  async createTicket(
    data: {
      summary: string;
      priority: string;
      inventoryTitle?: string;
      pageLink: string;
    },
    user: any,
  ) {
    const jsonData = {
      'Reported by': user.name || user.email,
      Inventory: data.inventoryTitle || '',
      Link: data.pageLink,
      Priority: data.priority,
      Summary: data.summary,
    };

    const filename = `support-ticket-${Date.now()}.json`;
    const path = '/support-tickets/' + filename;

    try {
      await this.dbx.filesUpload({
        path,
        contents: JSON.stringify(jsonData, null, 2),
      });
      return { message: 'Support ticket created successfully' };
    } catch (error) {
      throw new Error('Failed to upload ticket: ' + error.message);
    }
  }
}

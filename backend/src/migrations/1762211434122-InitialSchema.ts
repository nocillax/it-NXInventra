import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1762211434122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum type for access roles
    await queryRunner.query(`
            CREATE TYPE access_role_enum AS ENUM ('Owner', 'Editor', 'Viewer')
        `);

    // Create users table
    await queryRunner.query(`
            CREATE TABLE users (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                name varchar(100) NOT NULL,
                email varchar(150) NOT NULL,
                provider varchar(50) NOT NULL,
                provider_id varchar NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                updated_at timestamptz DEFAULT now() NOT NULL,
                blocked bool DEFAULT false NOT NULL,
                theme varchar(20) DEFAULT 'light'::character varying NOT NULL,
                language varchar(10) DEFAULT 'en'::character varying NOT NULL,
                "isAdmin" bool DEFAULT false NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
                CONSTRAINT "UQ_6425135effde2ab8322f8464932" UNIQUE (provider_id),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
            )
        `);

    // Create category_lookup table
    await queryRunner.query(`
            CREATE TABLE category_lookup (
                id serial4 NOT NULL,
                name varchar(100) NOT NULL,
                CONSTRAINT "PK_95a42e373cde574644ec96d8ac4" PRIMARY KEY (id),
                CONSTRAINT "UQ_5c75749bc966d80a83099a0bc30" UNIQUE (name)
            )
        `);

    // Create tags table
    await queryRunner.query(`
            CREATE TABLE tags (
                id serial4 NOT NULL,
                name varchar(50) NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY (id),
                CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE (name)
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_d90243459a697eadb8ad56e909" ON tags USING btree (name)`,
    );

    // Create inventories table (without search_vector)
    await queryRunner.query(`
            CREATE TABLE inventories (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                title varchar(150) NOT NULL,
                description text NULL,
                category varchar(100) NULL,
                public bool DEFAULT true NOT NULL,
                id_format jsonb NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                updated_at timestamptz DEFAULT now() NOT NULL,
                created_by uuid NOT NULL,
                CONSTRAINT "PK_7b1946392ffdcb50cfc6ac78c0e" PRIMARY KEY (id),
                CONSTRAINT "FK_c6755c34c98ddd49a1d1226ea03" FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

    // Create inventory_tags junction table
    await queryRunner.query(`
            CREATE TABLE inventory_tags (
                inventory_id uuid NOT NULL,
                tag_id int4 NOT NULL,
                CONSTRAINT "PK_e5e3419e5dded223d282c1d480a" PRIMARY KEY (inventory_id, tag_id),
                CONSTRAINT "FK_4e2f2c5c407108e8083e1cd9717" FOREIGN KEY (tag_id) REFERENCES tags(id),
                CONSTRAINT "FK_91a790a7e55c73e796511840b0b" FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_4e2f2c5c407108e8083e1cd971" ON inventory_tags USING btree (tag_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_91a790a7e55c73e796511840b0" ON inventory_tags USING btree (inventory_id)`,
    );

    // Create custom_fields table
    await queryRunner.query(`
            CREATE TABLE custom_fields (
                id serial4 NOT NULL,
                inventory_id uuid NOT NULL,
                title varchar(100) NOT NULL,
                description text NULL,
                type varchar(20) NOT NULL,
                show_in_table bool DEFAULT false NOT NULL,
                order_index int2 DEFAULT '0'::smallint NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                CONSTRAINT "PK_35ab958a0baec2e0b2b2b875fdb" PRIMARY KEY (id),
                CONSTRAINT "FK_d2f13fb4f8506c237af91ca82aa" FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_0e31ca4332c63e32e016fd2417" ON custom_fields USING btree (inventory_id, order_index)`,
    );

    // Create items table (without search_vector)
    await queryRunner.query(`
            CREATE TABLE items (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                custom_id varchar(50) NOT NULL,
                inventory_id uuid NOT NULL,
                likes int4 DEFAULT 0 NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                updated_at timestamptz DEFAULT now() NOT NULL,
                created_by uuid NOT NULL,
                sequence_number int4 NULL,
                version int4 NOT NULL,
                CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY (id),
                CONSTRAINT "FK_0833ba581c3e0d12bf32f486cf9" FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
                CONSTRAINT "FK_25a958155bb9a9d741210749e07" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_40199fe96f4a89d4058fcccf78" ON items USING btree (inventory_id, custom_id)`,
    );

    // Create item_field_values table
    await queryRunner.query(`
            CREATE TABLE item_field_values (
                id serial4 NOT NULL,
                item_id uuid NOT NULL,
                field_id int4 NOT NULL,
                value_text text NULL,
                value_number float8 NULL,
                value_boolean bool NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                CONSTRAINT "PK_1170600a95ce537ba11624e33ac" PRIMARY KEY (id),
                CONSTRAINT "FK_2c1bfd309e2635f5f6aa0bf57ec" FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE,
                CONSTRAINT "FK_68db3ef672cda1964f69cb88f33" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
            )
        `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6feca6e2abd183795553ffc6e0" ON item_field_values USING btree (item_id, field_id)`,
    );

    // Create item_likes table
    await queryRunner.query(`
            CREATE TABLE item_likes (
                user_id uuid NOT NULL,
                item_id uuid NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                CONSTRAINT "PK_31378e5c84800283f19e54060ac" PRIMARY KEY (user_id, item_id),
                CONSTRAINT "FK_c51f3d6ee230f00c0f652329628" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT "FK_da80574eb154bb6901d924da82d" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
            )
        `);

    // Create comments table
    await queryRunner.query(`
            CREATE TABLE comments (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                inventory_id uuid NOT NULL,
                message text NOT NULL,
                timestamp timestamptz DEFAULT now() NOT NULL,
                user_id uuid NOT NULL,
                CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY (id),
                CONSTRAINT "FK_01f8f3ce0f2a12c288b31cbd346" FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
                CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

    // Create access table
    await queryRunner.query(`
            CREATE TABLE access (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                inventory_id uuid NOT NULL,
                role access_role_enum NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL,
                user_id uuid NOT NULL,
                CONSTRAINT "PK_e386259e6046c45ab06811584ed" PRIMARY KEY (id),
                CONSTRAINT "FK_2d29a8162ec942b00d044d8e170" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT "FK_740ecae0f1c06fafba6a5800de6" FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE
            )
        `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2f0b1a9eac06911f50a1b498d2" ON access USING btree (inventory_id, user_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign key constraints)
    await queryRunner.query(`DROP TABLE access`);
    await queryRunner.query(`DROP TABLE comments`);
    await queryRunner.query(`DROP TABLE item_likes`);
    await queryRunner.query(`DROP TABLE item_field_values`);
    await queryRunner.query(`DROP TABLE items`);
    await queryRunner.query(`DROP TABLE custom_fields`);
    await queryRunner.query(`DROP TABLE inventory_tags`);
    await queryRunner.query(`DROP TABLE inventories`);
    await queryRunner.query(`DROP TABLE tags`);
    await queryRunner.query(`DROP TABLE category_lookup`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TYPE access_role_enum`);
  }
}

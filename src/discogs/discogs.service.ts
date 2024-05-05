import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
//@ts-ignore
import { Client } from 'disconnect';
import { VinylMongo } from 'src/schemas/vinyl.schema';
import { DiscogData } from 'src/types';

@Injectable()
export class DiscogsService {
  discogs = new Client({
    consumerKey: this.configService.get('DISCOGS_KEY'),
    consumerSecret: this.configService.get('DISCOGS_SECRET'),
  });

  constructor(private configService: ConfigService) {}

  async getRecords(query: { name: string }) {
    const records = await this.discogs
      .database()
      .search({ type: 'release', query: query.name });
    return records.results;
  }

  async getRecord(query: { id: string }) {
    const record = await this.discogs.database().getRelease(query.id);

    return this.getDataFromDiscogs(record);
  }

  async getDataFromDiscogs(record: any) {
    const result: DiscogData = {
      discogProdId: record.id,
      name: record.title,
      author: record.artists[0].name || 'Unknown',
      price: record.lowest_price,
      image: record.images[0].uri,
      averageDiscogScore: record.community.rating.average || 0,
      amountOfDiscogScores: record.community.rating.count || 0,
    };
    return result;
  }

  async updateDiscogScores(vinyl: VinylMongo) {
    if (vinyl.discogProdId) {
      const discogRecord = await this.getRecord({
        id: vinyl.discogProdId,
      });
      if (discogRecord) {
        vinyl.averageDiscogScore = +discogRecord.averageDiscogScore;
        vinyl.amountOfDiscogScores = +discogRecord.amountOfDiscogScores;
      }
    }
  }
}

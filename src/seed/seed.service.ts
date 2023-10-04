import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/pake-response-seed';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

interface PokemonToSeed {
  name: string;
  no: number;
}
@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=200',
    );

    const pokemonToSeed: PokemonToSeed[] = [];

    data.results.forEach(async ({ name, url }) => {
      const no = url.split('/')[6];
      // await this.pokemonModel.create({ name, no });
      pokemonToSeed.push({ name, no: Number(no) });
    });
    await this.pokemonModel.insertMany(pokemonToSeed);
    return 'Seed executed';
  }
}

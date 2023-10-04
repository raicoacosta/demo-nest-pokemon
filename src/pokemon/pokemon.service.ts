import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto, UpdatePokemonDto } from './dto/';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private paginationLimit: number;
  private paginationOffset: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ) {
    this.paginationLimit = this.configService.get('paginationLimit');
    this.paginationOffset = this.configService.get('paginationOffset');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const createdPokemon = await this.pokemonModel.create(createPokemonDto);
      return createdPokemon;
    } catch (error) {
      this.handlerError(
        error,
        `Pokemon with name ${createPokemonDto.name} already exists`,
      );
    }
  }
  findAll(paginationDto: PaginationDto) {
    const { limit = this.paginationLimit, offset = this.paginationOffset } =
      paginationDto;
    return this.pokemonModel
      .find()
      .skip(offset)
      .limit(limit)
      .sort({ no: 1 })
      .select('-_id -__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    // Search by number pokedex
    if (!isNaN(Number(term)))
      pokemon = await this.pokemonModel.findOne({ no: Number(term) });

    // Search by ID mongo
    if (!pokemon && isValidObjectId(term))
      pokemon = await this.pokemonModel.findById(term);

    // Search by name
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });

    if (!pokemon)
      throw new NotFoundException(`Pokemon with term ${term} not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
    } catch (error) {
      this.handlerError(
        error,
        `Pokemon with name ${updatePokemonDto.name} already exists`,
      );
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    // return { id };
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    const result = await this.pokemonModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException(`Pokemon with id ${id} not found`);
  }

  private handlerError(error: any, message: string) {
    if (error.code === 11000) throw new BadRequestException(message);
    console.log(error);
    throw new InternalServerErrorException('Something went wrong');
  }
}

/**
 * Mock API client for testing
 */

import { jest } from '@jest/globals';
import { CharacterOcid, CharacterBasic, CharacterStat, ItemEquipment, UnionInfo, GuildId, GuildBasic } from '../../src/api/types';

export class MockNexonApiClient {
  public getCharacterOcid = jest.fn();
  public getCharacterBasic = jest.fn();
  public getCharacterStat = jest.fn();
  public getCharacterItemEquipment = jest.fn();
  public getUnionInfo = jest.fn();
  public getUnionRaider = jest.fn();
  public getGuildInfo = jest.fn();
  public getOverallRanking = jest.fn();
  public getUnionRanking = jest.fn();
  public getGuildRanking = jest.fn();
  public getNoticeList = jest.fn();
  public getNoticeDetail = jest.fn();
  public getCubeProbability = jest.fn();
  public getStarforceProbability = jest.fn();
  public getClientHealth = jest.fn();

  constructor() {
    this.setupDefaultMocks();
  }

  private setupDefaultMocks() {
    // Character OCID mock
    this.getCharacterOcid.mockResolvedValue({
      ocid: 'test-ocid-12345'
    });

    // Character basic info mock
    this.getCharacterBasic.mockResolvedValue({
      date: '2024-01-15',
      character_name: 'TestCharacter',
      world_name: 'Aquila',
      character_gender: 'Male',
      character_class: 'Arch Mage (Fire, Poison)',
      character_class_level: '4',
      character_level: 250,
      character_exp: 1234567890,
      character_exp_rate: '15.75',
      character_guild_name: 'TestGuild',
      character_image: 'https://example.com/character.png',
      character_date_create: '2020-01-01',
      access_flag: 'true',
      liberation_quest_clear_flag: 'true'
    });

    // Character stats mock
    this.getCharacterStat.mockResolvedValue({
      date: '2024-01-15',
      character_class: 'Arch Mage (Fire, Poison)',
      final_stat: [
        { stat_name: 'STR', stat_value: '1000' },
        { stat_name: 'DEX', stat_value: '1000' },
        { stat_name: 'INT', stat_value: '25000' },
        { stat_name: 'LUK', stat_value: '1000' },
        { stat_name: 'HP', stat_value: '50000' },
        { stat_name: 'MP', stat_value: '30000' },
        { stat_name: 'Damage', stat_value: '95' },
        { stat_name: 'Boss Monster Damage', stat_value: '250' },
        { stat_name: 'Critical Rate', stat_value: '100' },
        { stat_name: 'Critical Damage', stat_value: '38' }
      ],
      remain_ap: 0
    });

    // Equipment mock
    this.getCharacterItemEquipment.mockResolvedValue({
      date: '2024-01-15',
      character_gender: 'Male',
      character_class: 'Arch Mage (Fire, Poison)',
      preset_no: 1,
      item_equipment: [
        {
          item_equipment_part: 'Hat',
          equipment_slot: 'Hat',
          item_name: 'Arcane Shade Hat',
          item_icon: 'https://example.com/hat.png',
          item_description: null,
          item_shape_name: 'Arcane Shade Hat',
          item_shape_icon: 'https://example.com/hat_shape.png',
          item_gender: null,
          item_total_option: {
            str: '40',
            dex: '40',
            int: '140',
            luk: '40',
            max_hp: '1500',
            max_mp: '1500',
            attack_power: '0',
            magic_power: '9',
            armor: '350',
            speed: '0',
            jump: '0'
          },
          starforce: '22',
          potential_option_grade: 'Legendary',
          potential_option_1: 'INT : +12%',
          potential_option_2: 'Magic Attack : +9%',
          potential_option_3: 'All Stats : +6%'
        }
      ]
    });

    // Union info mock
    this.getUnionInfo.mockResolvedValue({
      date: '2024-01-15',
      union_level: 8500,
      union_grade: 'Grand Master Union Lv.5',
      union_artifact_level: 15,
      union_artifact_exp: 1234567,
      union_artifact_point: 999999
    });

    // Guild info mock
    this.getGuildInfo.mockResolvedValue({
      date: '2024-01-15',
      world_name: 'Aquila',
      guild_name: 'TestGuild',
      guild_level: 30,
      guild_fame: 123456,
      guild_point: 654321,
      guild_master: 'GuildMaster',
      guild_member_count: 150,
      guild_member: [
        {
          character_name: 'GuildMaster',
          character_level: 275,
          character_class: 'Zero',
          character_gender: 'Male'
        },
        {
          character_name: 'GuildSubMaster',
          character_level: 250,
          character_class: 'Arch Mage (Fire, Poison)',
          character_gender: 'Female'
        }
      ],
      guild_skill: [
        {
          skill_name: 'Guild Blessing',
          skill_description: 'Increases experience gain.',
          skill_level: 15,
          skill_effect: '15% EXP increase',
          skill_icon: 'https://example.com/skill.png'
        }
      ]
    });

    // Rankings mock
    this.getOverallRanking.mockResolvedValue({
      ranking: [
        {
          date: '2024-01-15',
          ranking: 1,
          character_name: 'TopRanker',
          world_name: 'Aquila',
          character_class: 'Zero',
          sub_class_name: null,
          character_level: 295,
          character_exp: 999999999999,
          character_popularity: 12345,
          character_guildname: 'TopRankingGuild'
        }
      ]
    });

    // Health check mock
    this.getClientHealth.mockResolvedValue({
      status: 'healthy',
      errors: { total: 0, byType: {}, byCode: {} },
      performance: {},
      cache: { size: 0 },
      uptime: 12345
    });
  }

  // Helper methods for test scenarios
  mockCharacterNotFound() {
    this.getCharacterOcid.mockRejectedValue(new Error('Character not found'));
    this.getCharacterBasic.mockRejectedValue(new Error('Character not found'));
  }

  mockApiError(statusCode: number = 500) {
    const error = new Error('API Error');
    (error as any).response = { status: statusCode };
    
    this.getCharacterOcid.mockRejectedValue(error);
    this.getCharacterBasic.mockRejectedValue(error);
    this.getCharacterStat.mockRejectedValue(error);
  }

  mockRateLimitError() {
    const error = new Error('Rate limit exceeded');
    (error as any).response = { status: 429 };
    
    Object.values(this).forEach(method => {
      if (typeof method === 'function' && method.mockRejectedValue) {
        method.mockRejectedValue(error);
      }
    });
  }

  reset() {
    jest.clearAllMocks();
    this.setupDefaultMocks();
  }
}
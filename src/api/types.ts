/**
 * TypeScript interfaces for NEXON MapleStory Open API
 * Based on official NEXON Open API documentation
 */

// Base response structure
export interface BaseApiResponse {
  count?: number;
}

// Import MemoryCache type
import type { MemoryCache } from '../utils/cache';

export interface ApiError {
  error: {
    name: string;
    message: string;
  };
}

// Character related types
export interface CharacterBasic {
  date: string;
  character_name: string;
  world_name: string;
  character_gender: string;
  character_class: string;
  character_class_level: string;
  character_level: number;
  character_exp: number;
  character_exp_rate: string;
  character_guild_name: string;
  character_image: string;
}

export interface CharacterStat {
  date: string;
  character_class: string;
  final_stat: Array<{
    stat_name: string;
    stat_value: string;
  }>;
  remain_ap: number;
}

export interface CharacterHyperStat {
  date: string;
  character_class: string;
  use_preset_no: string;
  use_available_hyper_stat: number;
  hyper_stat_preset_1: Array<{
    stat_type: string;
    stat_point: number;
    stat_level: number;
    stat_increase: string;
  }>;
  hyper_stat_preset_2: Array<{
    stat_type: string;
    stat_point: number;
    stat_level: number;
    stat_increase: string;
  }>;
  hyper_stat_preset_3: Array<{
    stat_type: string;
    stat_point: number;
    stat_level: number;
    stat_increase: string;
  }>;
}

export interface CharacterPropensity {
  date: string;
  charisma_level: number;
  sensibility_level: number;
  insight_level: number;
  willpower_level: number;
  handicraft_level: number;
  charm_level: number;
}

export interface CharacterAbility {
  date: string;
  ability_grade: string;
  ability_info: Array<{
    ability_no: string;
    ability_grade: string;
    ability_value: string;
  }>;
  remain_fame: number;
  preset_no: number;
}

// Equipment related types
export interface ItemEquipment {
  date: string;
  character_gender: string;
  character_class: string;
  preset_no: number;
  item_equipment: Array<{
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string;
    item_total_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
      armor: string;
      speed: string;
      jump: string;
      boss_damage: string;
      ignore_monster_armor: string;
      all_stat: string;
      damage: string;
      equipment_level_decrease: number;
      max_hp_rate: string;
      max_mp_rate: string;
    };
    item_base_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
      armor: string;
      speed: string;
      jump: string;
      boss_damage: string;
      ignore_monster_armor: string;
      all_stat: string;
      max_hp_rate: string;
      max_mp_rate: string;
      base_equipment_level: number;
    };
    potential_option_grade: string;
    additional_potential_option_grade: string;
    potential_option_1: string;
    potential_option_2: string;
    potential_option_3: string;
    additional_potential_option_1: string;
    additional_potential_option_2: string;
    additional_potential_option_3: string;
    equipment_level_increase: number;
    equipment_exp: number;
    equipment_exp_rate: string;
    item_exceptional_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
    };
    item_add_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
      speed: string;
      jump: string;
      boss_damage: string;
      damage: string;
      all_stat: string;
      equipment_level_decrease: number;
    };
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string;
    soul_option: string;
    item_etc_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
      armor: string;
      speed: string;
      jump: string;
    };
    starforce: string;
    starforce_scroll_flag: string;
    item_starforce_option: {
      str: string;
      dex: string;
      int: string;
      luk: string;
      max_hp: string;
      max_mp: string;
      attack_power: string;
      magic_power: string;
      armor: string;
      speed: string;
      jump: string;
    };
    special_ring_level: number;
    date_expire: string;
  }>;
  title: {
    title_name: string;
    title_icon: string;
    title_description: string;
    date_expire: string;
    date_option_expire: string;
  };
  dragon_equipment: Array<{
    item_equipment_part: string;
    equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string;
  }>;
  mechanic_equipment: Array<{
    item_equipment_part: string;
    equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string;
  }>;
}

// Union related types
export interface UnionInfo {
  date: string;
  union_level: number;
  union_grade: string;
  union_artifact_level: number;
  union_artifact_exp: number;
  union_artifact_point: number;
}

export interface UnionRaider {
  date: string;
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_inner_stat: Array<{
    stat_field_id: string;
    stat_field_effect: string;
  }>;
  union_block: Array<{
    block_type: string;
    block_class: string;
    block_level: string;
    block_control_point: {
      x: number;
      y: number;
    };
    block_position: Array<{
      x: number;
      y: number;
    }>;
  }>;
  use_preset_no: number;
  union_raider_preset_1: {
    union_raider_stat: string[];
    union_occupied_stat: string[];
    union_inner_stat: Array<{
      stat_field_id: string;
      stat_field_effect: string;
    }>;
    union_block: Array<{
      block_type: string;
      block_class: string;
      block_level: string;
      block_control_point: {
        x: number;
        y: number;
      };
      block_position: Array<{
        x: number;
        y: number;
      }>;
    }>;
  };
  union_raider_preset_2: {
    union_raider_stat: string[];
    union_occupied_stat: string[];
    union_inner_stat: Array<{
      stat_field_id: string;
      stat_field_effect: string;
    }>;
    union_block: Array<{
      block_type: string;
      block_class: string;
      block_level: string;
      block_control_point: {
        x: number;
        y: number;
      };
      block_position: Array<{
        x: number;
        y: number;
      }>;
    }>;
  };
  union_raider_preset_3: {
    union_raider_stat: string[];
    union_occupied_stat: string[];
    union_inner_stat: Array<{
      stat_field_id: string;
      stat_field_effect: string;
    }>;
    union_block: Array<{
      block_type: string;
      block_class: string;
      block_level: string;
      block_control_point: {
        x: number;
        y: number;
      };
      block_position: Array<{
        x: number;
        y: number;
      }>;
    }>;
  };
}

// Guild related types
export interface GuildBasic {
  date: string;
  world_name: string;
  guild_name: string;
  guild_level: number;
  guild_fame: number;
  guild_point: number;
  guild_master_name: string;
  guild_member_count: number;
  guild_member: string[];
  guild_skill: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  guild_noblesse_skill: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  guild_mark: string;
  guild_mark_custom: string;
}

export interface GuildMember {
  guild_member: Array<{
    character_name: string;
    character_level: number;
    character_class: string;
  }>;
}

// Ranking related types
export interface OverallRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    character_name: string;
    world_name: string;
    class_name: string;
    sub_class_name: string;
    character_level: number;
    character_exp: number;
    character_popularity: number;
    character_guildname: string;
  }>;
}

export interface UnionRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    character_name: string;
    world_name: string;
    class_name: string;
    sub_class_name: string;
    union_level: number;
    union_power: number;
  }>;
}

export interface GuildRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    guild_name: string;
    world_name: string;
    guild_level: number;
    guild_master_name: string;
    guild_mark: string;
    guild_point: number;
  }>;
}

// Utility types for API client
export interface ApiClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cache?: MemoryCache;
}

export interface PaginationParams {
  count?: number;
  page?: number;
}

export interface DateParam {
  date?: string;
}

// Combined types for convenience
export type CharacterInfo = CharacterBasic &
  CharacterStat &
  CharacterHyperStat &
  CharacterPropensity &
  CharacterAbility;
export type EquipmentInfo = ItemEquipment;
export type RankingInfo = OverallRanking | UnionRanking | GuildRanking;

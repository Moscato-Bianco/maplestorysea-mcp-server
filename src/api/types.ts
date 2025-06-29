/**
 * TypeScript interfaces for NEXON MapleStory SEA Open API
 * Based on official NEXON Open API documentation for SEA region
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

// Character ID lookup
export interface CharacterOcid {
  ocid: string;
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

// Guild ID lookup
export interface GuildId {
  oguild_id: string;
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

// Additional Character types for missing endpoints
export interface CharacterPopularity {
  date: string;
  popularity: number;
  character_name: string;
}

export interface SymbolEquipment {
  date: string;
  character_class: string;
  symbol: Array<{
    symbol_name: string;
    symbol_icon: string;
    symbol_description: string;
    symbol_force: string;
    symbol_level: number;
    symbol_str: string;
    symbol_dex: string;
    symbol_int: string;
    symbol_luk: string;
    symbol_hp: string;
    symbol_growth_count: number;
    symbol_require_growth_count: number;
  }>;
}

export interface SetEffect {
  date: string;
  set_effect: Array<{
    set_name: string;
    total_set_count: number;
    set_effect_info: Array<{
      set_count: number;
      set_option: string;
    }>;
    set_option: string;
  }>;
}

export interface AndroidEquipment {
  date: string;
  android_name: string;
  android_nickname: string;
  android_icon: string;
  android_description: string;
  android_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  android_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  android_ear_sensor_clip_flag: string;
  android_gender: string;
  android_grade: string;
  android_skin_name: string;
  android_cash_item_equipment: Array<{
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string;
    cash_item_option: Array<{
      option_type: string;
      option_value: string;
    }>;
    date_expire: string;
    date_option_expire: string;
    cash_item_label: string;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    };
  }>;
  android_non_cash_item_equipment: Array<{
    non_cash_item_equipment_part: string;
    non_cash_item_equipment_slot: string;
    non_cash_item_name: string;
    non_cash_item_icon: string;
  }>;
  android_preset_1: any;
  android_preset_2: any;
  android_preset_3: any;
}

export interface PetEquipment {
  date: string;
  pet_1_name: string;
  pet_1_nickname: string;
  pet_1_icon: string;
  pet_1_description: string;
  pet_1_equipment: Array<{
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: Array<{
      option_type: string;
      option_value: string;
    }>;
    scroll_upgrade: string;
    scroll_upgradeable: string;
    item_shape: string;
    item_shape_icon: string;
  }>;
  pet_1_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_1_pet_type: string;
  pet_1_skill: Array<string>;
  pet_1_date_expire: string;
  pet_1_appearance: string;
  pet_1_appearance_icon: string;
  pet_2_name: string;
  pet_2_nickname: string;
  pet_2_icon: string;
  pet_2_description: string;
  pet_2_equipment: Array<{
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: Array<{
      option_type: string;
      option_value: string;
    }>;
    scroll_upgrade: string;
    scroll_upgradeable: string;
    item_shape: string;
    item_shape_icon: string;
  }>;
  pet_2_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_2_pet_type: string;
  pet_2_skill: Array<string>;
  pet_2_date_expire: string;
  pet_2_appearance: string;
  pet_2_appearance_icon: string;
  pet_3_name: string;
  pet_3_nickname: string;
  pet_3_icon: string;
  pet_3_description: string;
  pet_3_equipment: Array<{
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: Array<{
      option_type: string;
      option_value: string;
    }>;
    scroll_upgrade: string;
    scroll_upgradeable: string;
    item_shape: string;
    item_shape_icon: string;
  }>;
  pet_3_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_3_pet_type: string;
  pet_3_skill: Array<string>;
  pet_3_date_expire: string;
  pet_3_appearance: string;
  pet_3_appearance_icon: string;
}

export interface CharacterSkill {
  date: string;
  character_class: string;
  character_skill_grade: string;
  character_skill: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
}

export interface LinkSkill {
  date: string;
  character_class: string;
  character_link_skill: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_link_skill_preset_1: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_link_skill_preset_2: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_link_skill_preset_3: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_owned_link_skill: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_owned_link_skill_preset_1: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_owned_link_skill_preset_2: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
  character_owned_link_skill_preset_3: Array<{
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }>;
}

export interface VMatrix {
  date: string;
  character_class: string;
  character_v_core_equipment: Array<{
    slot_id: string;
    slot_level: number;
    v_core_name: string;
    v_core_type: string;
    v_core_level: number;
    v_core_skill_1: string;
    v_core_skill_2: string;
    v_core_skill_3: string;
  }>;
  character_v_matrix_remain_slot_upgrade_point: number;
}

export interface HexaMatrix {
  date: string;
  character_hexa_core_equipment: Array<{
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: Array<{
      hexa_skill_id: string;
    }>;
  }>;
  character_hexa_matrix_preset_1: Array<{
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: Array<{
      hexa_skill_id: string;
    }>;
  }>;
  character_hexa_matrix_preset_2: Array<{
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: Array<{
      hexa_skill_id: string;
    }>;
  }>;
  character_hexa_matrix_preset_3: Array<{
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: Array<{
      hexa_skill_id: string;
    }>;
  }>;
}

export interface HexaMatrixStat {
  date: string;
  character_class: string;
  character_hexa_stat_core: Array<{
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }>;
  preset_hexa_stat_core: Array<{
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }>;
}

export interface DojangRecord {
  date: string;
  character_class: string;
  world_name: string;
  dojang_best_floor: number;
  date_dojang_record: string;
  dojang_best_time: number;
}

export interface UnionArtifact {
  date: string;
  union_artifact_effect: Array<{
    name: string;
    level: number;
  }>;
  union_artifact_crystal: Array<{
    name: string;
    validity_flag: string;
    date_expire: string;
    level: number;
    crystal_option_name_1: string;
    crystal_option_name_2: string;
    crystal_option_name_3: string;
  }>;
  union_artifact_remain_ap: number;
}

// Additional Ranking types for missing endpoints
export interface DojangRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    character_name: string;
    world_name: string;
    class_name: string;
    sub_class_name: string;
    character_level: number;
    dojang_floor: number;
    dojang_time_record: number;
  }>;
}

export interface TheSeedRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    character_name: string;
    world_name: string;
    class_name: string;
    sub_class_name: string;
    character_level: number;
    theseed_floor: number;
    theseed_time_record: number;
  }>;
}

export interface AchievementRanking extends BaseApiResponse {
  ranking: Array<{
    date: string;
    ranking: number;
    character_name: string;
    world_name: string;
    class_name: string;
    sub_class_name: string;
    trophy_point: number;
    trophy_grade: string;
  }>;
}

// Combined types for convenience
export type CharacterInfo = CharacterBasic &
  CharacterStat &
  CharacterHyperStat &
  CharacterPropensity &
  CharacterAbility;
export type EquipmentInfo = ItemEquipment;
export type RankingInfo =
  | OverallRanking
  | UnionRanking
  | GuildRanking
  | DojangRanking
  | TheSeedRanking
  | AchievementRanking;

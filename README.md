# MCP Maple 🍁

NEXON 메이플스토리 오픈 API 데이터에 접근할 수 있는 종합적인 MCP(Model Context Protocol) 서버입니다. Claude 및 기타 MCP 호환 AI 어시스턴트를 통해 캐릭터 정보, 유니온 세부사항, 길드 데이터, 랭킹, 게임 메커니즘에 구조화된 접근을 제공합니다.

## ✨ 기능

- **캐릭터 정보**: 상세한 캐릭터 스탯, 장비, 기본 정보 조회
- **유니온 시스템**: 유니온 공격대 구성 및 랭킹 접근
- **길드 관리**: 길드 정보 및 멤버 세부사항 조회
- **랭킹**: 다양한 리더보드 및 경쟁 데이터 접근
- **게임 메커니즘**: 큐브 및 스타포스 강화 확률 정보
- **게임 업데이트**: 최신 공지사항 및 발표
- **TypeScript 지원**: 완전한 타입 안전성 및 IntelliSense 지원
- **종합적인 로깅**: 디버깅을 위한 상세한 작업 로깅
- **오류 처리**: 상세한 오류 메시지와 함께 강력한 오류 처리

## 🚀 빠른 시작

### NPX 사용 (권장)
```bash
npx mcp-maple --api-key YOUR_NEXON_API_KEY
```

### 설치
```bash
npm install -g mcp-maple
```

### Claude Desktop과 함께 사용

Claude Desktop MCP 설정에 추가 (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-maple": {
      "command": "npx",
      "args": ["-y", "mcp-maple"],
      "env": {
        "NEXON_API_KEY": "YOUR_NEXON_API_KEY"
      }
    }
  }
}
```

## 🛠️ 사용 가능한 MCP 도구

### 캐릭터 도구
- `get_character_basic_info` - 기본 캐릭터 정보 조회 (레벨, 직업, 월드, 길드)
- `get_character_stats` - 상세한 캐릭터 스탯 및 전투 스탯 조회
- `get_character_equipment` - 캐릭터 장비 및 아이템 세부사항 조회
- `get_character_full_info` - 종합적인 캐릭터 정보를 한 번에 조회

### 유니온 도구
- `get_union_info` - 유니온 레벨, 등급, 아티팩트 정보 조회
- `get_union_raider` - 유니온 공격대 보드 구성 및 블록 조회
- `get_union_ranking` - 유니온 파워 랭킹 조회

### 길드 도구
- `get_guild_info` - 길드 정보, 멤버, 스킬 조회
- `get_guild_ranking` - 길드 레벨 랭킹 조회

### 랭킹 도구
- `get_overall_ranking` - 필터링 옵션이 포함된 종합 레벨 랭킹 조회

### 유틸리티 도구
- `get_notice_list` - 게임 공지사항 및 발표 조회
- `get_notice_detail` - 상세한 공지사항 정보 조회
- `get_cube_probability` - 큐브 강화 확률 정보 조회
- `get_starforce_probability` - 스타포스 강화 확률 정보 조회
- `health_check` - API 연결 및 상태 확인

## 📖 사용 예시

### 캐릭터 정보 조회
```typescript
// 기본 캐릭터 정보 조회
const basicInfo = await getCharacterBasicInfo({
  characterName: "스카니아용사"
});

// 상세한 캐릭터 스탯 조회
const stats = await getCharacterStats({
  characterName: "스카니아용사",
  date: "2024-01-15"
});

// 캐릭터 장비 조회
const equipment = await getCharacterEquipment({
  characterName: "스카니아용사"
});
```

### 유니온 및 길드 데이터
```typescript
// 유니온 정보 조회
const unionInfo = await getUnionInfo({
  characterName: "스카니아용사"
});

// 길드 정보 조회
const guildInfo = await getGuildInfo({
  guildName: "길드명",
  worldName: "스카니아"
});
```

### 랭킹 및 리더보드
```typescript
// 종합 랭킹 조회
const rankings = await getOverallRanking({
  worldName: "스카니아",
  className: "아크메이지(불,독)",
  page: 1
});

// 유니온 랭킹 조회
const unionRankings = await getUnionRanking({
  worldName: "스카니아",
  page: 1
});
```

## 🔧 설정

### 환경 변수
- `NEXON_API_KEY` - NEXON 오픈 API 키 (필수)
- `LOG_LEVEL` - 로깅 레벨 (기본값: "info")
- `NODE_ENV` - 환경 (development/production)

### CLI 옵션
- `--api-key` - NEXON API 키
- `--port` - 서버 포트 (기본값: 3000)
- `--debug` - 디버그 로깅 활성화
- `--name` - 서버 이름 (기본값: "mcp-maple")
- `--version` - 서버 버전

## 🔑 NEXON API 키 얻기

1. [NEXON 오픈 API 포털](https://openapi.nexon.com/) 방문
2. 계정 가입 및 인증
3. 새 애플리케이션 생성
4. API 키 복사
5. `--api-key` 매개변수 또는 `NEXON_API_KEY` 환경변수로 사용

## 🎮 지원되는 게임 및 월드

### 메이플스토리 월드
- 스카니아 (Scania)
- 베라 (Bera)
- 루나 (Luna)
- 제니스 (Zenith)
- 크로아 (Croa)
- 유니온 (Union)
- 엘리시움 (Elysium)
- 이노시스 (Enosis)
- 레드 (Red)
- 오로라 (Aurora)
- 아케인 (Arcane)
- 노바 (Nova)
- 리부트 (Reboot)
- 리부트2 (Reboot2)

## 🚦 요청 제한 및 모범 사례

- **요청 제한**: API 키당 하루 500회 요청
- **요청 빈도**: 초당 최대 1회 요청
- **데이터 갱신**: 캐릭터 데이터는 매일 업데이트
- **캐시**: 더 나은 성능을 위한 결과 캐싱
- **오류 처리**: 일시적 실패에 대한 자동 재시도

## 🧪 개발

### 전제 조건
- Node.js 18+ 
- TypeScript 5.4+
- NEXON API 키

### 설정
```bash
git clone https://github.com/ljy9303/mcp-maple.git
cd mcp-maple
npm install
npm run build
```

### 빌드
```bash
npm run build          # TypeScript 빌드
npm run dev            # 개발 모드 (watch)
```

## 📚 API 참조

### 캐릭터 정보 도구

#### `get_character_basic_info`
레벨, 직업, 월드, 길드를 포함한 기본 캐릭터 정보를 조회합니다.

**매개변수:**
- `characterName` (string, 필수): 조회할 캐릭터 이름
- `date` (string, 선택사항): YYYY-MM-DD 형식의 날짜

**반환값:**
- `characterName`: 캐릭터 이름
- `level`: 캐릭터 레벨
- `job`: 캐릭터 직업/클래스
- `world`: 월드/서버 이름
- `guildName`: 길드 이름 (있는 경우)
- `exp`: 현재 경험치
- `expRate`: 경험치 비율 백분율

#### `get_character_stats`
데미지, 크리티컬 확률, 모든 전투 스탯을 포함한 상세한 캐릭터 통계를 조회합니다.

**매개변수:**
- `characterName` (string, 필수): 조회할 캐릭터 이름
- `date` (string, 선택사항): YYYY-MM-DD 형식의 날짜

**반환값:**
- `basicStats`: STR, DEX, INT, LUK, HP, MP
- `combatStats`: 공격력, 마력, 크리티컬 스탯
- `defenseStats`: 물리/마법 방어 스탯
- `allStats`: 완전한 스탯 분석

### 유니온 도구

#### `get_union_info`
유니온 레벨, 등급, 아티팩트 정보를 조회합니다.

**매개변수:**
- `characterName` (string, 필수): 조회할 캐릭터 이름
- `date` (string, 선택사항): YYYY-MM-DD 형식의 날짜

**반환값:**
- `unionLevel`: 현재 유니온 레벨
- `unionGrade`: 유니온 등급/랭크
- `unionArtifact`: 아티팩트 레벨 및 포인트

### 오류 처리

모든 도구는 일관된 오류 정보를 반환합니다:
```typescript
{
  success: false,
  error: "오류 설명",
  metadata?: {
    executionTime: number,
    apiCalls: number
  }
}
```

## 🤝 기여하기

기여를 환영합니다! 자세한 내용은 [기여 가이드](CONTRIBUTING.md)를 읽어주세요.

### 개발 프로세스
1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다
3. 변경사항을 작성합니다
4. 테스트를 추가합니다
5. 모든 테스트가 통과하는지 확인합니다
6. 풀 리퀘스트를 제출합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- 메이플스토리 오픈 API를 제공해 주신 [NEXON](https://www.nexon.com/)
- MCP 사양을 제공해 주신 [Model Context Protocol](https://modelcontextprotocol.io/)
- Claude 및 MCP 도구를 제공해 주신 [Anthropic](https://www.anthropic.com/)

## 📞 지원

- **이슈**: [GitHub Issues](https://github.com/ljy9303/mcp-maple/issues)
- **문서**: [API 참조](docs/API_REFERENCE.md)
- **예시**: [사용 예시](docs/EXAMPLES.md)

## 🔗 관련 프로젝트

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/desktop)
- [NEXON 오픈 API](https://openapi.nexon.com/)

---

메이플스토리 커뮤니티를 위해 ❤️로 제작되었습니다
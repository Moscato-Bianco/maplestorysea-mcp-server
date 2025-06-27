# MapleStory MCP Server 🍁

> **⚠️ NOTICE**: This package has been renamed to [`maplestory-mcp-server`](https://www.npmjs.com/package/maplestory-mcp-server) for better discoverability and standardization. Please use the new package for future installations.

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

> **🔄 Migration Notice**: If you're using the old `mcp-maple` package, please switch to `maplestory-mcp-server` for the latest updates and better support.

### NPX 사용 (권장)
```bash
# New package (recommended)
npx maplestory-mcp-server --api-key YOUR_NEXON_API_KEY

# Legacy support (still works)
npx mcp-maple --api-key YOUR_NEXON_API_KEY
```

### 설치
```bash
# New package (recommended)
npm install -g maplestory-mcp-server

# Legacy package
npm install -g mcp-maple
```

### 🖥️ Claude Desktop과 함께 사용

#### 1. NEXON API 키 준비
먼저 [NEXON 오픈 API 포털](https://openapi.nexon.com/)에서 API 키를 발급받으세요:
1. NEXON 계정으로 로그인
2. "개발자 센터" → "애플리케이션 관리" 이동
3. "새 애플리케이션 등록" 클릭
4. 애플리케이션 정보 입력 후 등록
5. 생성된 API 키 복사

#### 2. Claude Desktop 설정 파일 찾기
운영체제별 설정 파일 위치:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

#### 3. MCP 서버 설정 추가
설정 파일에 다음 내용을 추가하거나 수정하세요:

```json
{
  "mcpServers": {
    "maplestory-mcp-server": {
      "command": "npx",
      "args": ["-y", "maplestory-mcp-server"],
      "env": {
        "NEXON_API_KEY": "여기에_발급받은_API_키_입력"
      }
    }
  }
}
```

**Legacy Configuration (still supported):**
```json
{
  "mcpServers": {
    "mcp-maple": {
      "command": "npx", 
      "args": ["-y", "mcp-maple"],
      "env": {
        "NEXON_API_KEY": "여기에_발급받은_API_키_입력"
      }
    }
  }
}
```

> ⚠️ **중요**: `YOUR_NEXON_API_KEY`를 실제 발급받은 API 키로 교체하세요.

#### 4. Claude Desktop 재시작
설정 파일을 수정한 후 Claude Desktop을 완전히 종료했다가 다시 시작하세요.

#### 5. 연결 확인
Claude Desktop이 재시작되면 새 대화에서 다음과 같이 입력해 연결을 확인하세요:

```
메이플스토리 API가 정상적으로 작동하는지 확인해줘
```

성공적으로 연결되면 Claude가 메이플스토리 관련 질문에 답할 수 있습니다!

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

### 🎯 Claude Desktop에서 질문하기

Claude Desktop에서 다음과 같은 자연어로 메이플스토리 정보를 조회할 수 있습니다:

#### 캐릭터 정보 조회
```
"김코인"이라는 캐릭터의 기본 정보를 알려줘
```

```
"베라월드용사" 캐릭터의 상세한 스탯 정보를 조회해줘
```

```
"리부트용사" 캐릭터가 착용하고 있는 장비 목록을 보여줘
```

#### 유니온 및 길드 정보
```
"스카니아용사" 캐릭터의 유니온 정보를 조회해줘
```

```
"스카니아" 월드의 "길드명" 길드 정보를 알려줘
```

#### 랭킹 조회
```
스카니아 월드의 아크메이지(불,독) 직업 랭킹 1페이지를 보여줘
```

```
베라 월드의 유니온 랭킹 상위 20명을 조회해줘
```

#### 게임 정보
```
메이플스토리 최신 공지사항을 확인해줘
```

```
레드 큐브의 강화 확률 정보를 알려줘
```

### 💡 활용 팁

#### 1. 캐릭터 종합 분석
```
"스카니아용사" 캐릭터의 모든 정보를 종합적으로 분석해줘 (기본정보, 스탯, 장비, 유니온)
```

#### 2. 길드 관리
```
"베라" 월드의 "우리길드" 길드원들의 레벨과 직업을 정리해줘
```

#### 3. 랭킹 비교
```
"스카니아" 월드와 "베라" 월드의 상위 랭커들을 비교 분석해줘
```

#### 4. 진행 상황 추적
```
"내캐릭터" 캐릭터의 어제와 오늘 스탯 변화를 비교해줘
```

### 🔧 프로그래밍 예시

개발자를 위한 직접 API 호출 예시:

#### 캐릭터 정보 조회
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

#### 유니온 및 길드 데이터
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

#### 랭킹 및 리더보드
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

### 상세 가이드

1. **NEXON 오픈 API 포털 접속**
   - [https://openapi.nexon.com/](https://openapi.nexon.com/) 방문

2. **계정 생성 및 로그인**
   - NEXON 계정으로 로그인 (게임 계정과 동일)
   - 계정이 없다면 회원가입 진행

3. **개발자 센터 이동**
   - 상단 메뉴에서 "개발자 센터" 클릭
   - "애플리케이션 관리" 선택

4. **새 애플리케이션 등록**
   - "새 애플리케이션 등록" 버튼 클릭
   - 필수 정보 입력:
     - **애플리케이션 이름**: `MCP Maple` (예시)
     - **애플리케이션 설명**: `Claude Desktop MCP 서버용`
     - **서비스 URL**: `http://localhost` (개발용)

5. **API 키 발급 및 복사**
   - 등록 완료 후 API 키 확인
   - API 키 복사 (보안을 위해 안전한 곳에 저장)

6. **API 키 사용**
   - Claude Desktop 설정에서 `NEXON_API_KEY`로 사용
   - 또는 CLI에서 `--api-key` 매개변수로 사용

> 💡 **팁**: API 키는 외부에 노출되지 않도록 주의하세요. GitHub 등 공개 저장소에 업로드하지 마세요.

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

## 🔧 문제 해결

### 일반적인 문제들

#### 1. Claude Desktop에서 mcp-maple이 인식되지 않는 경우

**증상**: Claude Desktop에서 메이플스토리 관련 질문을 해도 응답하지 못함

**해결방법**:
1. Claude Desktop을 완전히 종료
2. 설정 파일 경로가 올바른지 확인:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
3. JSON 형식이 올바른지 확인 (쉼표, 괄호 등)
4. Claude Desktop 재시작

#### 2. API 키 오류

**증상**: "API key is invalid" 또는 "Authentication failed" 오류

**해결방법**:
1. [NEXON 오픈 API 포털](https://openapi.nexon.com/)에서 API 키 상태 확인
2. API 키가 만료되지 않았는지 확인
3. 설정 파일에서 API 키가 올바르게 입력되었는지 확인
4. API 키 앞뒤 공백 제거

#### 3. 캐릭터를 찾을 수 없는 경우

**증상**: "Character not found" 오류

**해결방법**:
1. 캐릭터 이름을 정확히 입력 (대소문자, 특수문자 포함)
2. 해당 캐릭터가 실제로 존재하는지 게임에서 확인
3. 캐릭터가 최근에 생성된 경우 하루 정도 기다린 후 재시도

#### 4. 요청 제한 초과

**증상**: "Rate limit exceeded" 오류

**해결방법**:
1. 잠시 기다린 후 재시도 (1분 정도)
2. 요청 빈도를 줄여서 사용
3. 하루 500회 제한을 초과하지 않도록 주의

#### 5. 네트워크 연결 문제

**증상**: "Network error" 또는 "Timeout" 오류

**해결방법**:
1. 인터넷 연결 상태 확인
2. 방화벽이나 프록시 설정 확인
3. 잠시 후 재시도

### 디버깅 방법

#### 1. 상세한 로그 확인
```bash
npx mcp-maple --debug --api-key YOUR_API_KEY
```

#### 2. 연결 테스트
Claude Desktop에서 다음과 같이 입력하여 연결 상태를 확인:
```
메이플스토리 API 연결 상태를 확인해줘
```

#### 3. 설정 파일 검증
JSON 형식이 올바른지 온라인 JSON 검증기에서 확인하세요.

### 알려진 제한 사항

- **API 호출 제한**: 하루 500회, 초당 1회
- **데이터 갱신**: 캐릭터 정보는 매일 오전 8시경 업데이트
- **지원 월드**: 일부 테스트 서버나 특수 월드는 지원되지 않을 수 있음

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
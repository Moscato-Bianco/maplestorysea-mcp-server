# Claude Desktop MCP 설정 가이드

## 테스트 결과 요약

✅ **MCP-Maple v1.0.1 최적화 완료**
- 테스트 파일 및 의존성 제거 완료
- MCP 서버 전용 설정으로 최적화
- 15개 도구 등록 완료
- 환경변수를 통한 API 키 설정 지원

✅ **Claude Desktop MCP 호환성**
- `npx -y mcp-maple` 명령어로 직접 실행 가능
- 환경변수 NEXON_API_KEY 지원
- JSON-RPC 통신 정상 작동

## Claude Desktop 설정 방법

### 1. 설정 파일 위치

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
~/.config/claude-desktop/claude_desktop_config.json
```

### 2. 설정 파일 내용

```json
{
  "mcpServers": {
    "mcp-maple": {
      "command": "npx",
      "args": ["-y", "mcp-maple"],
      "env": {
        "NEXON_API_KEY": "test_ad3d7e1b077a2fd3a09cbb763bd499f66dd1f2de543c377a874e24ec31024e46efe8d04e6d233bd35cf2fabdeb93fb0d",
        "LOG_LEVEL": "info",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. 일반적인 오류 및 해결책

#### 3.1 Node.js 관련 오류
```bash
# Node.js 버전 확인
node --version
npm --version

# 최신 버전으로 업데이트 (권장: v18 이상)
```

#### 3.2 권한 오류
```bash
# npm 글로벌 설치 권한 설정 (Linux/macOS)
sudo npm install -g mcp-maple

# 또는 npx 사용 (권장)
```

#### 3.3 API 키 관련 오류
- 환경변수에 올바른 NEXON API 키 설정 확인
- 키 형식 검증 (64자 길이의 16진수 문자열)

### 4. 디버깅 방법

#### 4.1 MCP 서버 직접 테스트
```bash
# 서버 시작 및 로그 확인
NEXON_API_KEY=your_key_here npx mcp-maple --debug

# JSON-RPC 메시지로 도구 목록 확인
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | NEXON_API_KEY=your_key_here npx mcp-maple
```

#### 4.2 Claude Desktop 로그 확인
**Windows:**
```
%LOCALAPPDATA%\Claude\logs\
```

**macOS:**
```
~/Library/Logs/Claude/
```

### 5. 사용 가능한 도구 목록

1. **health_check** - 서버 및 API 상태 확인
2. **get_character_basic_info** - 캐릭터 기본 정보
3. **get_character_stats** - 캐릭터 스탯 정보
4. **get_character_equipment** - 캐릭터 장비 정보
5. **get_character_full_info** - 캐릭터 종합 정보
6. **get_union_info** - 유니온 정보
7. **get_union_raider** - 유니온 공격대 정보
8. **get_union_ranking** - 유니온 랭킹
9. **get_guild_info** - 길드 정보
10. **get_guild_ranking** - 길드 랭킹
11. **get_overall_ranking** - 종합 랭킹
12. **get_notice_list** - 공지사항 목록
13. **get_notice_detail** - 공지사항 상세
14. **get_cube_probability** - 큐브 확률 정보
15. **get_starforce_probability** - 스타포스 확률 정보

### 6. 예제 사용법

Claude Desktop에서 다음과 같이 사용:

```
캐릭터 "테스트캐릭터"의 기본 정보를 조회해주세요.
```

```
리부트 서버의 길드 랭킹을 보여주세요.
```

```
스타포스 강화 확률 정보를 알려주세요.
```

## 트러블슈팅

### 자주 발생하는 문제들

1. **"command not found" 오류**
   - Node.js 및 npm 설치 확인
   - PATH 환경변수 설정 확인

2. **"API key invalid" 오류**
   - NEXON_API_KEY 환경변수 설정 확인
   - API 키 형식 및 유효성 검증

3. **"Connection timeout" 오류**
   - 네트워크 연결 상태 확인
   - 방화벽 설정 확인

4. **MCP 서버 연결 실패**
   - Claude Desktop 재시작
   - 설정 파일 JSON 문법 검증
   - 로그 파일 확인

### 성능 최적화

- `LOG_LEVEL`을 "warn" 또는 "error"로 설정하여 로그 출력 최소화
- `NODE_ENV`를 "production"으로 설정
- 필요시 캐싱 설정 추가

## 결론

MCP-Maple 서버는 정상적으로 작동하며, Claude Desktop과의 연동을 위해서는 올바른 설정 파일 구성과 환경변수 설정이 필요합니다. 위의 가이드를 따라 설정하시면 메이플스토리 API 기능을 Claude Desktop에서 활용할 수 있습니다.
# Ramocky Music

基于 React Native 0.88 的音乐播放器，支持多音乐源切换。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React Native 0.88.1（新架构）+ React 19.3 |
| 语言 | TypeScript |
| 导航 | React Navigation 7（native-stack） |
| 播放 | react-native-video 6.19.3 |
| 构建 | Gradle 9 + JDK 17 + GitHub Actions |

## 音乐源

播放能力被抽象成 `MusicProvider` 接口（`src/api/music/types.ts`），换源不影响页面层。

| 源 | 说明 | 能力 |
| --- | --- | --- |
| **Audius**（默认） | 官方公开 API，免 Key | 搜索、热门、完整播放 |
| **iTunes** | Apple 官方搜索 API | 搜索、30 秒试听 |

新增一个源只需实现 `MusicProvider` 并在 `src/api/music/index.ts` 的 `providers` 中注册。

## 功能

- 搜索与热门，上滑分页、下拉刷新；弱网 8 秒超时并可点击重试
- 全局播放器：切页不中断，上一首 / 下一首 / 列表循环 / 单曲循环
- 可拖动进度条、倍速（0.75x ~ 2x）、定时关闭（15 / 30 / 60 分钟）、系统分享
- 播放失败自动跳过坏曲，也可手动重试当前曲
- 播放队列页：点选切歌、长按移除单曲、一键清空
- 收藏、最近播放（各 30 条）、搜索历史（10 条）落地到 AsyncStorage，收藏支持长按取消
- 自适应启动图标、单色主题图标（Android 13+），按钮均带无障碍标签

## 本地运行

```bash
npm install
npm run android
```

要求 Node ≥ 22.11、JDK 17、Android SDK（compileSdk 37）。

## 打包

CI 在每次推送 `master` / `feat/rn-088-rewrite`、以及打 `v*` tag 时自动构建：

```bash
./gradlew assembleRelease   # 在 android/ 下执行
```

按 ABI 拆包，产出：

- `app-arm64-v8a-release.apk` — 64 位（V8）
- `app-armeabi-v7a-release.apk` — 32 位（V7）

产物在 Actions 的 `ramocky-music-apk` artifact 中；打 tag 时会自动挂到 Release。

版本号由 CI 注入：tag 构建取 tag 名（如 `v1.2.0` → `1.2.0`），分支构建为 `0.0.<构建序号>`，`versionCode` 使用构建序号，保证每次安装包可区分升级。

### 签名

未配置 Secrets 时自动回退 debug 签名，APK 仍可直接安装。要使用正式签名，在仓库 Secrets 中配置：

| Secret | 说明 |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | keystore 文件的 base64 |
| `ANDROID_KEYSTORE_PASSWORD` | keystore 密码 |
| `ANDROID_KEY_ALIAS` | key 别名 |
| `ANDROID_KEY_PASSWORD` | key 密码 |

## 目录结构

```
src/
├── api/music/      # 音乐源抽象与实现
├── components/     # TrackRow、SeekBar、Skeleton 等展示组件
├── navigation/     # 路由参数类型
├── screens/        # Home / Player / Queue / Library
├── state/          # 全局播放器与收藏/历史状态
├── storage/        # AsyncStorage 读写封装
└── theme.ts        # 配色
```

## 已知限制

- iTunes 源只有 30 秒试听
- iOS 侧未验证构建

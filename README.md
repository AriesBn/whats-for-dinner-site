# 晚饭吃什么 🍲

Android 本地菜品管理应用，帮你解决每天不知道吃什么的问题！

## 功能

- **添加菜品**：拍照或从相册选择，填写名称，选择分类标签
- **分类展示**：按荤菜、素菜、汤、主食四大分类展示
- **今天吃什么**：随机抽取一道菜，带动画效果
- **每日推送**：定时通知栏推送今日推荐

## 技术栈

| 技术 | 说明 |
|------|------|
| Kotlin | 开发语言 |
| Jetpack Compose | UI 层 |
| Room | 本地数据库 |
| Hilt | 依赖注入 |
| Coil | 图片加载 |
| WorkManager | 定时任务推送 |
| CameraX | 拍照功能 |
| DataStore | 偏好设置存储 |

## 最低要求

- Android 7.0+ (API 24)
- 目标 SDK 34

## 如何使用

### 方式一：Android Studio（推荐）

1. 安装 **Android Studio**（https://developer.android.com/studio）
2. 打开此项目目录 `whats_for_dinner/`
3. Android Studio 会自动下载 Gradle 和各种依赖
4. 等待同步完成后，点击运行按钮即可在模拟器或真机上运行

### 方式二：命令行构建

如果你已安装 Android SDK 和 Gradle：

```bash
# 设置环境变量（Windows）
set ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk

# 生成 Gradle wrapper（如果还没有的话）
gradle wrapper

# 构建调试 APK
./gradlew assembleDebug

# APK 输出位置
# app/build/outputs/apk/debug/app-debug.apk
```

## 项目结构

```
app/src/main/java/com/dinner/whatsfordinner/
├── DinnerApplication.kt          # 应用入口
├── MainActivity.kt               # 主 Activity + 底部导航
├── di/
│   └── AppModule.kt              # Hilt 依赖注入模块
├── navigation/
│   └── AppNavHost.kt             # 导航路线定义
├── data/
│   ├── local/
│   │   ├── AppDatabase.kt        # Room 数据库
│   │   ├── entity/
│   │   │   ├── CategoryEntity.kt # 分类实体
│   │   │   └── DishEntity.kt     # 菜品实体
│   │   └── dao/
│   │       ├── CategoryDao.kt    # 分类 DAO
│   │       └── DishDao.kt        # 菜品 DAO
│   ├── repository/
│   │   ├── DishRepository.kt     # 菜品仓储
│   │   └── CategoryRepository.kt # 分类仓储
│   ├── photo/
│   │   └── PhotoManager.kt       # 图片管理（保存/压缩/删除）
│   └── prefs/
│       └── NotificationPrefsRepository.kt  # 通知偏好设置
├── ui/
│   ├── theme/
│   │   ├── Color.kt              # 暖色调色板
│   │   ├── Theme.kt              # 应用主题
│   │   └── Type.kt               # 排版样式
│   ├── components/
│   │   ├── DishCard.kt           # 菜品卡片组件
│   │   └── CategoryHeader.kt     # 分类头部组件
│   ├── screens/
│   │   ├── DishListScreen.kt     # 首页-菜品列表
│   │   ├── AddDishScreen.kt      # 添加菜品弹窗
│   │   ├── RandomPickerScreen.kt # 随机选择器
│   │   └── SettingsScreen.kt     # 设置页面
│   └── viewmodels/
│       ├── DishListViewModel.kt
│       ├── AddDishViewModel.kt
│       ├── RandomPickerViewModel.kt
│       └── SettingsViewModel.kt
└── worker/
    ├── DailyDinnerWorker.kt      # 定时推送 Worker
    └── BootReceiver.kt           # 开机广播接收器
```

## 注意事项

- 所有数据存储在本地，无需联网
- 图片存储在应用内部存储，卸载应用后会清理
- 首次安装时会自动预置四个分类：荤菜、素菜、汤、主食

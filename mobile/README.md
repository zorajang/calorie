# Mobile App

这是 `calorie` 的手机端骨架，使用 `Expo + Expo Router`。

## 运行

1. 复制环境变量：

```bash
cp .env.example .env
```

2. 把 `EXPO_PUBLIC_API_BASE_URL` 改成你本机运行 Next.js 的地址。

示例：

```env
EXPO_PUBLIC_API_BASE_URL="http://10.0.0.121:3000"
```

如果你在手机真机上调试，不能用 `localhost`，必须用你电脑局域网 IP。

3. 安装依赖并启动：

```bash
npm install
npm run start
```

## 当前页面

- `Today`：今日热量总览、快速添加、常吃食物、体重记录
- `History`：热量/体重趋势、历史搜索
- `Settings`：个人资料设置

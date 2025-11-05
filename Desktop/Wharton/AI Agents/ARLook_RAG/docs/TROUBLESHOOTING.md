# Google Maps API Key 故障排查指南

## 🔍 当前错误诊断

看到 "This page didn't load Google Maps correctly" 错误，需要检查以下几点：

## ✅ 检查清单

### 1. API Key 配置检查
- [x] ✅ API Key已添加到 `.env.local` 文件
- [x] ✅ API Key格式正确（以 `AIza` 开头）
- [ ] ⚠️ **需要确认**：API Key限制设置是否正确

### 2. Google Cloud Console 配置检查

#### 必须完成的配置：

**A. 启用 Maps JavaScript API**
1. 访问：https://console.cloud.google.com/apis/library
2. 搜索 "Maps JavaScript API"
3. 点击进入详情页
4. 确认状态为 "已启用"（如果显示"启用"按钮，请点击启用）

**B. 配置 API Key 限制**

访问：https://console.cloud.google.com/apis/credentials

点击您的API Key进入详情，检查：

**应用限制**：
- [ ] 已选择 "HTTP引荐来源网址（网站）"
- [ ] 已添加 `http://localhost:3000/*`
- [ ] 已添加 `http://127.0.0.1:3000/*`

**API限制**：
- [ ] 已选择 "限制密钥"
- [ ] 已勾选 "Maps JavaScript API"
- [ ] 已保存设置

### 3. 浏览器控制台检查

按 `F12` 打开开发者工具，查看 Console 标签中的错误信息：

**常见错误类型**：

1. **RefererNotAllowedMapError**
   ```
   解决方案：在Google Cloud Console中配置HTTP引荐来源网址限制
   添加：http://localhost:3000/*
   ```

2. **InvalidKeyMapError**
   ```
   解决方案：检查API Key是否正确复制，确认没有多余空格
   确认Maps JavaScript API已启用
   ```

3. **ApiNotActivatedMapError**
   ```
   解决方案：在Google Cloud Console中启用Maps JavaScript API
   访问：https://console.cloud.google.com/apis/library
   ```

4. **QuotaExceededError**
   ```
   解决方案：检查API使用配额，可能需要等待或升级计划
   ```

## 🔧 快速修复步骤

### 如果看到 RefererNotAllowedMapError：

1. 访问：https://console.cloud.google.com/apis/credentials
2. 点击API Key：`AIzaSyBwyYq-3nFHRva9PFOZoRVhsUR4elX5Vvc`
3. 在"应用限制"部分：
   - 选择 "HTTP引荐来源网址（网站）"
   - 点击 "添加项目"
   - 输入：`http://localhost:3000/*`
   - 点击 "完成"
   - 点击 "保存"
4. 等待1-2分钟让设置生效
5. 刷新浏览器页面

### 如果看到 ApiNotActivatedMapError：

1. 访问：https://console.cloud.google.com/apis/library
2. 搜索 "Maps JavaScript API"
3. 点击进入详情页
4. 点击 "启用" 按钮
5. 等待几秒钟
6. 刷新浏览器页面

### 如果看到 InvalidKeyMapError：

1. 确认API Key没有多余的空格或换行
2. 重新复制API Key
3. 更新 `.env.local` 文件：
   ```bash
   echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBwyYq-3nFHRva9PFOZoRVhsUR4elX5Vvc" > .env.local
   echo "OPENAI_API_KEY=your_openai_key_here" >> .env.local
   ```
4. 重启开发服务器

## 🧪 测试API Key是否有效

创建一个测试文件来验证API Key：

```bash
# 创建测试脚本
cat > test-api-key.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBwyYq-3nFHRva9PFOZoRVhsUR4elX5Vvc&callback=initMap" async defer></script>
</head>
<body>
    <div id="map" style="height:400px; width:100%;"></div>
    <script>
        function initMap() {
            const map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 39.9526, lng: -75.1652 },
                zoom: 14
            });
            console.log('Map loaded successfully!');
        }
    </script>
</body>
</html>
EOF

# 打开测试页面
open test-api-key.html
```

如果这个测试页面能显示地图，说明API Key本身是有效的，问题可能在Next.js配置或API限制设置。

## 📞 获取帮助

如果以上步骤都无法解决问题：

1. 查看浏览器控制台的完整错误信息
2. 检查Google Cloud Console中的API使用情况
3. 确认API Key的配额限制设置

## 💡 临时解决方案

即使地图暂时无法显示，您仍然可以：
- ✅ 测试聊天功能
- ✅ 测试预设提示词
- ✅ 测试房源过滤逻辑
- ✅ 查看API调用（浏览器Network标签）

地图功能修复后，这些功能会自动与地图联动。



# publicShare
 Share some reusable plugins and something interesting of vue when I as a member of a team (Rosie is me also)

## * publicRepertory (plugins)

### history storage
    用 HTML5 本地存储新功能(localStorage)实现，本地存储插件，提供数据本地存储，获取本地存储数据和清除本地存储数据。

### image-canvas
    同样用 HTML5 Canvas新功能实现，同时配合 touch.js，create.js 使用(处理图片触屏事件和canvas高级图片处理)。
    支持选择图片，缩放图片，移动图片，旋转图片，生成新图片。

### load-image
    动态图片路径加载，配合 Swipe.js 使用，常用于移动端图片滑动切换图片加载。


## * vueProject
  某项目采用基于 MVVM 模式，其中 Vue.js 负责 ViewModel 和 View 部分，把 Model 切割为 Service 与 IO，前者负责业务逻辑，后者负责数据。IO 层本职负责前端数据的 IO，向上层屏蔽具体的数据来源。

  vueProject 是此项目主要 IO 层实现部分，同时为确保 IO 层数据的完备而进行 e2e 测试。

  为保证 IO 层数据的可信任，IO 层对上层数据调用统一返回 promise。

```
  type ErrorObject = {
    status: string = ‘error’,
    message: string
  }

  type SuccessObject = {
    status: string = ‘okay’,
    data: any
  }
```

import React from 'react'
import ImageGallery from 'react-image-gallery'
import { SERVER_SETTING, DEBUG } from './App.js'

class Hint extends React.Component{
    render(){
        return(
            <div className="hint">
                <img src="/images/hint.png"/>
                <span>{` 空格键可以滚动，←/→左右箭头可以翻页哦`}</span>
            </div>
        )
    }
}

export default class ReadPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = { image_base_url: null, cur_ch_pages: 0 }
    }

    componentDidMount() {
        const url = `${SERVER_SETTING.url}/read/${this.props.match.params.id}/${this.props.match.params.chapter}`
        // 必须这种分两步的写法。。。why???
        fetch(url)
            .then(resp => {
                return resp.json()
            })
            .then(json => {
                document.title = json.name
                    ? `${json.name} 第 ${this.props.match.params.chapter} ${json.suffix} - 魂漫`
                    : '魂漫 - 我们的童年，一直都在'
                this.setState({
                    image_base_url: json.image_base_url,
                    cur_ch_pages: json.cur_ch_pages
                })
            })
    }

    formatPage(i) {
        let res = i + ''
        if (i < 10) {
            res = '00' + i
        } else if (i < 99) {
            res = '0' + i
        }
        return res
    }

    rendImage(image) {
        // 使用自动的render方法
        return (
            <div style={{ textAlign: 'center' }}>
                <img src={image.original} alt="cover" />
            </div>
        )
    }

    // 自定义的话。。。不支持图片的::before动画。。。没法玩了
    // renderLeftNav(onClick, disabled) {
    //   return (
    //     <a
    //       // type='button'
    //       className='image-gallery-left-nav'
    //       disabled={disabled}
    //       onClick={onClick}
    //       // aria-label='Previous Slide'
    //     >
    //     <img src="/images/gallery_nav.png" />
    //     </a>
    //   );
    // }

    render() {
        // 左右箭头翻页，上下箭头滚动
        // fixed: 两个问题，一个是翻页之后滚动条没有重置，还一个是图片应该显示源大小即可，不要缩放
        if (!this.state.image_base_url) {
            return <div><h2>待ってください、Loading.....</h2><img src="/images/loading.gif" alt="loading" /></div>
        } else {
            console.log('page length ' + this.state.cur_ch_pages)
            const images_arr = []
            for (let i = 1; i <= this.state.cur_ch_pages; i++) {
                const url =
                    this.state.image_base_url +
                    '/' +
                    this.props.match.params.id +
                    '/' +
                    this.formatPage(this.props.match.params.chapter) +
                    '/' +
                    this.formatPage(i) +
                    '.jpg'
                // console.log(url + ', ' + this.state.cur_ch_pages)
                images_arr.push(url)

                // test
                // if(DEBUG && i > 10){
                //     break
                // }
            }
            const images = images_arr.map(image => ({
                original: image,
                renderItem: this.rendImage
            }))
            let show = true
            if (this.state.cur_ch_pages > 30) {
                show = false
            }
            return (
                <div>
                    <ImageGallery
                        items={images}
                        slideInterval={2000}
                        showBullets={show}
                        infinite={false}
                        lazyLoad={true}
                        onImageLoad={null}
                        showFullscreenButton={false} //全屏先关了。。不能滚是bug...
                        showPlayButton={false}
                        // showIndex={false}
                        showThumbnails={false}
                        renderLeftNav={this.renderLeftNav}
                    />
                    <Hint/>
                </div>
            )
        }
    }
}
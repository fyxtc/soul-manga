import React from 'react'
import ImageGallery from 'react-image-gallery'
import { SERVER_SETTING, STYLES } from './App.js'

export default class ReadPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = { image_base_url: null, cur_ch_pages: 0 }
    }

    componentDidMount() {
        const url = `${SERVER_SETTING.url}/read/${this.props.match.params.id}/chapter/${this.props.match.params.chapter}`
        // 必须这种分两步的写法。。。why???
        fetch(url)
            .then(resp => {
                return resp.json()
            })
            .then(json => {
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
            <div style={{ textAlign: 'center' /*border: '2px solid red'*/ }}>
                <img src={image.original} />
            </div>
        )
    }

    render() {
        // 左右箭头翻页，上下箭头滚动
        // todo: 两个问题，一个是翻页之后滚动条没有重置，还一个是图片应该显示源大小即可，不要缩放
        if (!this.state.image_base_url) {
            return <h1>Loading</h1>
        } else {
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
                console.log(url + ', ' + this.state.cur_ch_pages)
                images_arr.push(url)
                // test
                if (i > 10) {
                    break
                }
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
                <ImageGallery
                    items={images}
                    slideInterval={2000}
                    showBullets={show}
                    infinite={false}
                    lazyLoad={true}
                    onImageLoad={null}
                    /*showFullscreenButton={false}*/
                    showPlayButton={false}
                    // showIndex={false}
                    showThumbnails={false}
                />
            )
        }
    }
}
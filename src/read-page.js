import React from 'react'
import ImageGallery from 'react-image-gallery'
import { SERVER_SETTING, STYLES } from './App.js'

export default class ReadPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = { images: null }
    }

    componentDidMount() {
        const url = `${SERVER_SETTING.url}/read/${this.props.match.params.id}/page/${this.props.match.params.page}`
        // 必须这种分两步的写法。。。why???
        fetch(url)
            .then(resp => {
                return resp.json()
            })
            .then(json => {
                this.setState({ images: json })
            })
    }

    render() {
        if (!this.state.images) {
            return <h1>Loading</h1>
        } else {
            const images_arr = this.state.images.split(',')
            const images = images_arr.map(image => ({
                original: `${SERVER_SETTING.image}/${image}`
            }))
            return (
                <ImageGallery
                    items={images}
                    slideInterval={2000}
                    showBullets={true}
                    infinite={false}
                    onImageLoad={null}
                />
            )
        }
    }
}
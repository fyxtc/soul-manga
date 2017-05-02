import React from 'react'
import { Col, Row, Image } from 'react-bootstrap'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { SERVER_SETTING, STYLES } from './App.js'

class Cover extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Col md={6} style={{ border: '3px solid red' }}>
        <Image
          src={`${SERVER_SETTING.image}/${this.props.cover_image}`}
          thumbnail
          responsive
        />
      </Col>
    )
  }
}

class Info extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const info = this.props.info
    return (
      <Col md={6} mdOffset={0} style={STYLES.border}>
        <br /><br /><br />
        <p>{'last update: ' + info.last_update_date}</p>
        <p>{'status: ' + info.status}</p>
        <p>{'pop: ' + info.pop}</p>
        <p>{'category: ' + info.category}</p>
        <p>{'tags: ' + info.tags}</p>
        <p>
          {'chapters: ' +
            info.chapters[0] +
            ' - ' +
            info.chapters[info.chapters.length - 1]}
        </p>
      </Col>
    )
  }
}

class Summary extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Col
        md={12}
        mdOffset={0}
        style={{ border: '3px solid black', padding: 20, textAlign: 'center' }}>
        {this.props.summary}
        <Row
          style={{ border: '3px solid black', padding: 20, textAlign: 'left' }}>
          <p>
            {
              '不擅長運動與學習、做什麼事沒有恆心、一事無成的少年澤田綱吉，在他面前出現了一位自稱里包恩的殺手，是個要作他家庭教師的小嬰兒。目的是要培育阿綱成為義大利黑手黨彭哥列家族的第10代首領。里包恩利用被打中後會拚死完成臨終時後悔的事情的彭哥列秘彈「死氣彈」，讓阿綱成為適當首領的「教育」開始了。'
            }
          </p>
        </Row>
      </Col>
    )
  }
}

class Chapter extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const chapters = this.props.chapters.split(',')
    const items = chapters.map(ch => (
      <ChapterItem key={ch} ch={ch} id={this.props.id} />
    ))
    return (
      <Col md={12} mdOffset={0} style={{ padding: '5rem 1rem' }}>
        {items}
      </Col>
    )
  }
}

class ChapterItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Router>
        <Col
          md={3}
          style={{ top: 0, border: '3px solid red', textAlign: 'center' }}>
          <Link
            to={`/read/${this.props.id}/page/${this.props.ch}`}
            target="_self">{`第 ${this.props.ch} 话`}</Link>
        </Col>
      </Router>
    )
  }
}

class Footer extends React.Component {
  render() {
    return (
      <Col
        md={12}
        mdOffset={0}
        style={{
          padding: '2rem',
          border: '3px solid red',
          textAlign: 'center'
        }}>
        <span> ShindouHikaru Copyright </span>
      </Col>
    )
  }
}

export default class MangaInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      info: null
    }
    console.log('info ctor')
  }

  componentDidMount() {
    const url = `${SERVER_SETTING.url}/info/${this.props.match.params.id}`

    fetch(url)
      .then(resp => {
        return resp.json()
      })
      .then(json => {
        console.log(json)
        this.setState({ info: json })
      })
  }

  render() {
    if (!this.state.info) {
      return <h1>Loading</h1>
    } else {
      const info = this.state.info
      return (
        <Col md={6} mdOffset={3} style={STYLES.info}>
          <Row>
            <Cover cover_image={info.cover_image} />
            <Info info={info} />
          </Row>
          <Row>
            <Summary summary={info.summary} />
          </Row>
          <Row>
            <Chapter chapters={info.chapters} id={info.id} />
          </Row>
          <Row>
            <Footer />
          </Row>
        </Col>
      )
    }
  }
}
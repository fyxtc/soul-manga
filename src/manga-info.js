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
          src={`${this.props.cover_image}`}
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
          {'chapters: ' + info.cover_update_info}
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
        {this.props.name + '簡介'}
        <Row
          style={{ border: '3px solid black', padding: 20, textAlign: 'left' }}>
          {this.props.summary}
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
    let chapters = []
    for(let i = 1; i <= this.props.all_chapters_len; i++){
      chapters.push(<ChapterItem key={this.props.mid+'-'+i} ch={i} mid={this.props.mid} />)
    }


    // const chapters = this.props.chapters.split(',')
    // const items = chapters.map(ch => (
    //   <ChapterItem key={ch} ch={ch} id={this.props.mid} />
    // ))
    return (
      <Col md={12} mdOffset={0} style={{ padding: '5rem 1rem' }}>
        {chapters}
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
            to={`/read/${this.props.mid}/chapter/${this.props.ch}`}
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
            <Summary summary={info.summary} name={info.name} />
          </Row>
          <Row>
            <Chapter all_chapters_len={info.all_chapters_len} mid={info.mid} />
          </Row>
          <Row>
            <Footer />
          </Row>
        </Col>
      )
    }
  }
}
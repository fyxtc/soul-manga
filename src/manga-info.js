import React from 'react'
import { Col, Row, Image } from 'react-bootstrap'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { SERVER_SETTING, STYLES, Footer } from './App.js'
import $ from 'jquery'

class Cover extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Col md={12} className="cover" >
        <Image src={`${this.props.cover_image}`} thumbnail responsive />
      </Col>
    )
  }
}

class Info extends React.Component {
  constructor(props) {
    super(props)
    self.categorys = [
      '格斗',
      '魔法',
      '侦探',
      '竞技',
      '恐怖',
      '战国',
      '魔幻',
      '冒险',
      '校园',
      '搞笑',
      '少女',
      '少男',
      '科幻',
      '港产',
      '其他',
      '全部' 
    ]
  }

  render() {
    const info = this.props.info
    return (
      <Col md={12} mdOffset={0} className="info" >
        <div>
          <h5>{'最后更新: ' + info.last_update_date}</h5>
          <h5>{'原创作者: ' + info.author}</h5>
          <h5>{'连载状态: ' + info.status}</h5>
          <h5>{'人气指数: ' + info.pop}</h5>
          <h5>{'漫画分类: ' + self.categorys[info.category]}</h5>
          <h5>{'漫画标签: ' + info.tags}</h5>
          <h5>
            {'收录漫画: ' + info.cover_update_info}
          </h5>
        </div>
        <div className="info-image" >
          <AutoType />
          <Image src="/images/mengbi.png" className="mengbi" />
          <Image src="/images/buka.gif" className="buka" />
        </div>
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
        className="summary">
        <div className="summary-title" >
          <span>{this.props.name + '简介'}</span>
        </div>
        <div className="summary-content">
          {this.props.summary}
        </div>
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
    for (let i = 1; i <= this.props.all_chapters_len; i++) {
      chapters.push(
        <ChapterItem
          key={this.props.mid + '-' + i}
          ch={i}
          mid={this.props.mid}
          vol_or_ch={this.props.vol_or_ch}
        />
      )
    }

    // const chapters = this.props.chapters.split(',')
    // const items = chapters.map(ch => (
    //   <ChapterItem key={ch} ch={ch} id={this.props.mid} />
    // ))
    return (
      <Col md={12} mdOffset={0} className="chapter" >
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
    const suffix = this.props.vol_or_ch ? '卷' : '话'
    return (
      <Router>
        <Col md={2} className="chapter-item   hvr-radial-out" >
          <Link
            to={`/read/${this.props.mid}/chapter/${this.props.ch}`}
            target="_self">{`第 ${this.props.ch} ${suffix}`}</Link>
        </Col>
      </Router>
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

    $(document).ready(function() {
        $('body').css('background-image', 'url(../images/op.png)')
    })
  }

  render() {
    if (!this.state.info) {
      return <h1>待ってください、Loading.....</h1>
    } else {
      const info = this.state.info
      return (
        <div >
          <Col md={6} mdOffset={3} className="info-page" >
            <Col md={5} >
              <Cover cover_image={info.cover_image} />
            </Col>
            <Col md={7} >
              <Info info={info} />
            </Col>
            <Summary summary={info.summary} name={info.name} />
            <Chapter all_chapters_len={info.all_chapters_len} mid={info.mid} vol_or_ch={info.vol_or_ch} />
          </Col>
          <Col>
              <Footer />
          </Col>
        </div>
      )
    }
  }
}

class AutoType extends React.Component {
  componentDidMount() {
    var words = [
       'Hey girl ~',
       '.........',
       '何者だこら',
       '俺様のことを知ってるか',
       '.........',
       'あ の。。。。',
       'も し も し',
       'すみません。。。。',
       '何をしているですか',
       '一体。。。',
       'あのさ、　お前、　これ上手ですよね',
       '俺を教えていいですか',
       '。。。。。。。。。。。。',
       'おう、なぜ何も言わないよ',
       '俺、こんなに可愛いなのに',
       '不愉快ですよね',
       'じゃ、俺も言わない',
       '。。。。。。。。。。。。',
       '。。。。。。。。。。。。',
       'くそ、　お前の勝ちだ',
       'よっし、　決めだ',
       '静かにあなたを見てる',
       '終 　わ　　る',
       '最後まで見てた、　ありがとうございます',
       'さあ、もう一回、　始まるよ'
     ],
      // words = ['我需要来一发了','这里合适吗。。。','这个，容我三思一下', '！@#￥@#！￥@#$@', '那就来一发吧', '那么问题来了', '你也需要来一发吗？'],
      part,
      i = 0,
      offset = 0,
      len = words.length,
      forwards = true,
      skip_count = 0,
      skip_delay = 5,
      is_over = false,
      speed = 120;

    var wordflick = function() {
      setInterval(function() {
        if (is_over) {
          return
        }
        if (forwards) {
          if (offset >= words[i].length) {
            ++skip_count
            if (skip_count == skip_delay) {
              forwards = false
              skip_count = 0
            }
          }
        } else {
          // if(i === len){
          //   is_over = true
          //   return
          // }
          if (offset == 0) {
            forwards = true
            i++
            offset = 0
            if (i >= len) {
              i = 0
            }
          }
        }
        part = words[i].substr(0, offset)
        if (skip_count == 0) {
          if (forwards) {
            offset++
          } else {
            offset--
          }
        }
        $('.auto-type').text(part)
      }, speed)
    }
    $(document).ready(function() {
      wordflick()
    })
  }
  render() {
    return <div className="auto-type" />
  }
}






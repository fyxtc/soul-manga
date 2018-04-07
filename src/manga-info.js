import React from 'react'
// import { Col, Row, Image } from 'react-bootstrap'
import Col from 'react-bootstrap/lib/Col'
import Image from 'react-bootstrap/lib/Image'

import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { SERVER_SETTING, Footer, CUR_MANGA_NAME } from './App.js'
import $ from 'jquery'
// import {Helmet} from "react-helmet"

// $(document).ready(function(){
//   const url = window.location.pathname.split( '/' )
//   const name = url[url.length-1]
//   const title = `${name} - 热门连载漫画_高清在线漫画_免费漫画 - 魂漫 - Soul Comic` 
//   $('title').text(title)
//   $('meta[name=description]').attr('content', `${name} 描述`)
//   $('meta[name=keywords]').attr('content', `${name} 漫画`)
// })

class Cover extends React.Component {
  constructor(props) {
    super(props)
  }

  // todo 做成书的背框
  render() {
    return (
      <div className="cover">
      <Image src={`${this.props.cover_image}`} thumbnail responsive />
      </div>
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
    // var cw = $('.cover').height()
    // let infoHeight = $(document)[0].body.clientWidth / 2 * 0.33 * 4 / 3
    // console.log("fuck " + infoHeight)
    // $('.info').css('height',infoHeight+'px')
    // console.log($('.info'))
    // 本来想做了author路由去匹配作者的超链接，然后发现直接用search过去得了...反正名字
    const info = this.props.info
    return (
      <Col md={12} mdOffset={0} className="info" >
        <div>
          <h5>{'最后更新: ' + info.last_update_date}</h5>
          <h5>{'原创作者: '}<Link to={'/search/' + info.author} target="_blank"> {info.author}</Link></h5>
          <h5>{'连载状态: ' + info.status}</h5>
          <h5>{'人气指数: ' + info.pop}</h5>
          <h5>{'漫画分类: ' + self.categorys[info.category]}</h5>
          <h5>{'漫画标签: ' + info.tags.split(',').join(' ')}</h5>
          <h5>
            {'收录漫画: ' + info.cover_update_info}
          </h5>
        </div>
          {/*<AutoType />*/}
          {/*<Image src="/images/mengbi.png" className="mengbi" />*/}
          <Image src="/images/disco.png" className="disco" />
          <Image src="/images/buka.gif" className="buka" />
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

class Vol extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    let vols = []
    let volLine = []
    const lineCount = 6
    for (let i = 1; i <= this.props.all_vols_len; i++) {
      vols.push(
        <ChapterItem
          key={this.props.mid + '-' + i}
          ch={1 + i - 1}
          // chapter_start_index={this.props.chapter_start_index}
          mid={this.props.mid}
          vol_or_ch={1}
        />
      )

      if(i % lineCount === 0){
        volLine.push(<tr key={i}>{vols.slice(i-lineCount, i)}</tr>)
      }
    }

    // 补上不满足lineCount一行的剩下的内容
    const leftIndex = this.props.all_vols_len - volLine.length * lineCount
    volLine.push(<tr key={volLine.length+1}>{vols.slice(vols.length - leftIndex)}</tr> )

    return (
      <Col md={12} mdOffset={0} className="vol" >
        <table>
          <tbody>
            {volLine}
          </tbody>
        </table>
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
    let chapterLine = []
    const lineCount = 6
    let len = this.props.all_chapters_len
    // len = 5
    console.log('chapter start ' + this.props.chapter_start_index + ' len ' + len)
    for (let i = 1; i <= len; i++) {
      chapters.push(
        <ChapterItem
          key={this.props.mid + '-' + i}
          ch={this.props.chapter_start_index + i - 1}
          mid={this.props.mid}
          // chapter_start_index={this.props.chapter_start_index}
          vol_or_ch={0}
        />
      )

      if(i > 0 && i % lineCount === 0){
        chapterLine.push(<tr key={chapterLine.length}>{chapters.slice(i-lineCount, i)}</tr>)
      }
    }

    // 补上不满足lineCount一行的剩下的内容
    const leftIndex = len - chapterLine.length * lineCount
    chapterLine.push(<tr key={chapterLine.length}>{chapters.slice(chapters.length - leftIndex)}</tr> )

    // const chapters = this.props.chapters.split(',')
    // const items = chapters.map(ch => (
    //   <ChapterItem key={ch} ch={ch} id={this.props.mid} />
    // ))
    return (
      <Col md={12} mdOffset={0} className="chapter" >
        <table>
          <tbody>
            {chapterLine}
          </tbody>
        </table>
      </Col>
    )
  }
}

class ChapterItem extends React.Component {
  constructor(props) {
    super(props)
  }

  paddingZero(ch){
    if(ch < 10){
      return '00' + ch
    }else if(ch < 100){
      return '0' + ch
    }else{
      return ch
    }
  }

  render() {
    const suffix = this.props.vol_or_ch ? '卷' : '话'
    const vol_ch = this.props.vol_or_ch ? 'vol' : 'chapter'
    let ch = this.paddingZero(this.props.ch)
    // if(!this.props.vol_or_ch){
    //   ch = this.paddingZero(this.props.ch)
    // }
    return (
      <td>
      <Router>
        <Col md={2} className="chapter-item   hvr-radial-out" >
          <Link
            to={`/read/${this.props.mid}/${this.props.ch}`}
            target="_blank">{`第 ${ch} ${suffix}`}</Link>
        </Col>
      </Router>
      </td>
    )
  }
}


export default class MangaInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      info: null
    }
    // console.log('info ctor')
    console.log(CUR_MANGA_NAME)
    console.log(this.props)
    document.title = `${this.props.match.params.name} - 热门连载漫画_高清在线漫画_免费漫画 - 魂漫 - Soul Comic` 

    // this.setMeta()
  }

  setMeta(){
    // 额 没抓取到啊。。。是html一定要有meta，还是说还是不能用jquery....
    // document.title = `${this.props.match.params.name} - 热门连载漫画_高清在线漫画_免费漫画 - 魂漫 - Soul Comic` 
    // const name = this.props.match.params.name
    // const title = `${name} - 热门连载漫画_高清在线漫画_免费漫画 - 魂漫 - Soul Comic` 
    // $('title').text(title)
    // $('meta[name=keywords]').attr('content', `${name} 漫画 在线观看`)
    // $('meta[name=description]').attr('content', `${name}高清漫画在线观看 最新热门连载漫画尽在魂漫  魂漫是一个专注分享漫画的平台，这里有免费的高清在线漫画，希望每个喜爱看漫画的孩子都能保持一颗看漫画时候的纯真的心。`)
  }


  componentDidMount() {
    // console.log('manga name: ' + this.props.route.name)
    const url = `${SERVER_SETTING.url}/info/${this.props.match.params.name}`

    fetch(url)
      .then(resp => {
        return resp.json()
      })
      .then(json => {
        // document.title = json.name ? (`${json.name} - 高清在线漫画_免费漫画 - 魂漫`) : '魂漫 - 我们的童年 一直都在'
        console.log(json)
        this.setState({ info: json })
      })

    // $($(document)).ready(function() {
    //     $('body').css('background-image', 'url(../images/op.jpg)')
    // })
  }

  // render(){
  //   return <Loader />
  // }

  render() {
    if (!this.state.info) {
      // return <h1>待ってください、Loading.....</h1>
      // return <loader />
      return <div className="loader"><img src="/images/loading.gif" alt="loading" /></div>
    } else {
      const info = this.state.info
      let volView
      if(info.all_vols_len){
        volView = <Vol all_vols_len={info.all_vols_len} mid={info.mid} vol_or_ch={info.vol_or_ch} />
      }
      let chView
      if(info.all_chapters_len){
        chView = <Chapter all_chapters_len={info.all_chapters_len} mid={info.mid} vol_or_ch={info.vol_or_ch} chapter_start_index={info.chapter_start_index} />
      }
      return (

        <div >
          <Col md={6} mdOffset={3} className="info-page" >
            <Col >
              <Col md={5} >
                <Cover cover_image={info.cover_image} />
              </Col>
              <Col md={7} >
                <Info info={info} />
              </Col>
            </Col>
            <Summary summary={info.summary} name={info.name} />
            {volView}
            {chView}
          </Col>
          <Col>
              <Footer />
          </Col>
        </div>
      )
    }
  }
}








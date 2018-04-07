import React, { Component } from 'react'
import './App.css'
// import Chinese from 'chinese-s2t'
// 注意啊，这种导入的语法根本没用，把所有的rb里面的东西都导出来了，大小根本没有缩小，
// 和https://react-bootstrap.github.io/getting-started.html#commonjs说得不一样，只能用直接导入lib/这样的方式，麻痹。。。这种也没变化，
// 我知道为什么没变化了，因为我在其他的js里面是这样的写法！！！！！必须都改过来！！！！
// import {Button, FormControl, Glyphicon, Form, Col,  Image } from 'react-bootstrap'
import Button from 'react-bootstrap/lib/Button'
import FormControl from 'react-bootstrap/lib/FormControl'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Form from 'react-bootstrap/lib/Form'
import Col from 'react-bootstrap/lib/Col'
import Image from 'react-bootstrap/lib/Image'

import InfiniteScroll from 'react-infinite-scroller'
import {BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
// 下面这样写也能减少8KB
// import {BrowserRouter from 'react-router-dom/BrowserRouter'
// import Route from 'react-router-dom/Route'
// import Link from 'react-router-dom/Link'

// import { LinkContainer } from 'react-router-bootstrap'
import MangaInfo from './manga-info' // ./必须写，不然找不到，可能去node_moudle里
import ReadPage from './read-page'
// import ReactDOM from 'react-dom'
// import Radium from 'radium'
import $ from 'jquery'
import jQuery from 'jquery'
// import {Helmet} from "react-helmet"



export const DEBUG = true
// export const DEBUG = false

if(!DEBUG){
    console.log=function(){
    }
}
console.log('DEBUG MODE IS ' + DEBUG + ' !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

export const SERVER_SETTING = {
  // 8000是gunicorn, 后面的localhost
  url: DEBUG ? 'http://localhost:5000' : 'http://103.80.29.187:8000',
  // image: 'http://localhost:5000/static/image'
  image: ''
}

// export var CUR_MANGA_NAME = '魂漫'
// if(!window.name){
//   window.name = '魂漫a'
// }

class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: '',
      redirect: false
    }
    this.enter = false
  }

  handleInput(e) {
    // this.props.handleInput(e.target.value)
    // 自己重绘自己
    this.setState({ searchKey: e.target.value })
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      console.log('enter')
      this.enter = true
      this.setState({ redirect: true })
    }
  }

  render() {
    // if (this.state.redirect) {
    //   console.log('redirect')
    //   return <Redirect push to={'/search/' + this.state.searchKey} target="_blank" />
    // }
    // console.log("search render")
    let re = null
    if(this.enter){
      this.enter = false
      re = <Redirect push to={'/search/' + this.state.searchKey} target="_blank" />
    }

    return (
      <Router>
        <Form className="search-bar">
          {re}
          <Col className="ft1 animated tada" md={2}>
            <Image src="/images/ft.png" />
          </Col>
          <LogoText1 />
          <Col className="ft2 animated tada" md={2}>
            <Image src="/images/ft.png" />
          </Col>
          <Col md={4} mdOffset={0} className="input-control">
            <FormControl
              className="input-text"
              type="text"
              placeholder="哟，少年 不来一发吗 😃"
              value={this.state.searchKey}
              onChange={this.handleInput.bind(this)}
              onKeyPress={this.handleKeyPress.bind(this)}
            />
          </Col>
          <Col className="button-control ">
            <Link to={'/search/' + this.state.searchKey} target="_self">
              <Button
                bsStyle="primary"
                className="hvr-buzz"
                /*bsSize="lg"*/ onClick={this.props.handleSearch}
                style={{ height: '3rem', width: '8rem', float: 'left' }}>
                <Glyphicon glyph="search" />
                <span> 来一发</span>
              </Button>
            </Link>
          </Col>
        </Form>
      </Router>
    )
  }
}

class CategoryItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addSpace: true
    }
    this.spaceWith = 1380
  }

  /**
   * Calculate & Update state of new dimensions
   */
  updateDimensions() {
    // console.log(window.innerWidth)
    if (window.innerWidth < this.spaceWith && this.state.addSpace) {
      this.setState({ addSpace: false })
    }

    if (window.innerWidth >= this.spaceWith && !this.state.addSpace) {
      this.setState({ addSpace: true })
    }
  }

  /**
   * Add event listener
   */
  componentDidMount() {
    // document.title = '魂漫 - 连载的是漫画 永不完结的是童年 - Soul Comic'
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  render() {
    let text
    if (!this.state.addSpace) {
      text = `${this.props.text[0]}${this.props.text[1]}`
    } else {
      text = `${this.props.text[0]} ${this.props.text[1]}`
    }
    // console.log(text)
    return (
      <div className="category-item" /*title={text}*/ >
        <div>
          <span>{text}</span>
        </div>
        <Image src="/images/scroll.png" />
      </div>
    )
  }
}

class CategoryBar extends React.Component {
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

  // 风扇呼呼的啊卧槽。。。
  /*componentDidMount(){
    jQuery(document).ready(function($){
      // Define a blank array for the effect positions. This will be populated based on width of the title.
      var bArray = []
      // Define a size array, this will be used to vary bubble sizes
      var sArray = [4, 6, 8, 10]

      // Push the header width values to bArray
      for (var i = 0; i < $('.category-nav').width(); i++) {
        bArray.push(i)
      }

      // Function to select random array element
      // Used within the setInterval a few times
      function randomValue(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
      }     
      // setInterval function used to create new bubble every 350 milliseconds
      setInterval(function() {
        // Get a random size, defined as variable so it can be used for both width and height
        var size = randomValue(sArray)
        // New bubble appeneded to div with it's size and left position being set inline
        // Left value is set through getting a random value from bArray
        $('.category-nav').append(
          '<div class="individual-bubble" style="left: ' +
            randomValue(bArray) +
            'px; width: ' +
            size +
            'px; height:' +
            size +
            'px;"></div>'
        )

        // Animate each bubble to the top (bottom 100%) and reduce opacity as it moves
        // Callback function used to remove finsihed animations from the page
        $('.individual-bubble').animate(
          {
            bottom: '100%',
            opacity: '-=0.7'
          },
          3000,
          function() {
            $(this).remove()
          }
        )
      }, 350) 
    })
  }*/

  render() {
    // console.log("fuck width" + $(window).innerWidth())
    return (
      <Router>
        <div className="category-bar">
          <Col md={8} mdOffset={2} className="category-nav">
            {self.categorys.map((v, k) => (
              <Link
                key={'cat' + k}
                to={'/category/' + k}
                className="hvr-wobble-vertical ">
                <CategoryItem text={v}/>
              </Link>
            ))}
          </Col>
          <Route exact path="/" component={MangaView} />
          <Route path="/category/:id" component={MangaView} />
          <Route
            path="/search/:key"
            component={MangaView}
            searchKey={this.searchKey}
          />
        </div>
      </Router>
    )
  }


}

// 本来推荐如果comp里面没有动态的东西的话，应该用箭头格式而不是用类...像router例子里面一样，再说吧
// 应该还是更新MangaView，只不过sql变了




class MangaItem extends React.Component {
  constructor(props) {
    super(props)
  }

  handleClick(){
    // CUR_MANGA_NAME = this.props.data.name
    // window.MY.name = this.props.data.name
    // console.log('change manga name to ' + CUR_MANGA_NAME)
    // document.title = CUR_MANGA_NAME + ' 高清在线漫画-免费漫画 魂漫 ' 
  }

  render() {
    // target='_self'必须要。。为啥？
    // 图片转换为320*240不然怎么办啊。。。我日，好他妈奇怪啊，为啥百分比就适配不了, overflow也失效了，你麻痹。。，用background解决了,nice
    // console.log(this.props)
    let str = ''
    if(this.props.data.last_update_chapter){
      str = '更新到 ' + this.props.data.last_update_chapter + ' 话'
    }else{
      str = '更新到 ' + this.props.data.all_vols_len + ' 卷'
    }
    return (
      // backgroundImage当然没有alt，但是可以给所在的div加上title即可，简直6
      // info改为传入name了，算是为seo的一个妥协吧。。不然出了服务器渲染外真心没办法。。。。
      <Router>
        <Col
          className="manga-item hvr-pulse-grow "
          md={2}
          style={{ textAlign: 'center' }}>
          <Link to={`/info/${this.props.data.name}`} target="_blank" title={this.props.data.name} onClick={this.handleClick.bind(this)} >
            <div className="manga-item-content">
              <div
                className="manga-item-image"
                style={{
                  backgroundImage: `url(${this.props.data.cover_image}`
                }}
              >
              <div className="last-update" ><p>{str}</p></div>
              </div>
              <span>{this.props.data.name}</span>
            </div>
          </Link>
        </Col>
      </Router>
    )
  }
}

class MangaView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasMoreItems: true,
      items: [],
      category: 1,
      cat_page: 0,
    }
    this.show_no_result = false
    this.searchKey = ''
    this.needIgnore = false
    console.log(this.props.route)
  }

  componentWillReceiveProps(nextProps) {
    // 这个方法应该也不要了...路由对了直接在didmount加载才是正确的做法
    this.setState({ hasMoreItems: true, items: [], cat_page: 0 })
    // const key = this.props.match.params.key
  }

  loadItems(page) {
    // console.log(this.props)
    const key = this.props.match.params.key
    // const cat = this.props.match.params.id
    if (this.props.match.params.id || key) {
      if (!this.props.match.params.key) {
        const url = `${SERVER_SETTING.url}/category/${this.props.match.params.id}/${this.state.cat_page++}`
        fetch(url).then(resp => resp.json()).then(json => {
          // console.log("fetch data len " + json.data.length)
          // todo 有可能延迟回来进入了其他tab，这里需要通过返回category和当前category(nav切换)来判断，如果是搜索，则通过search key来判断，那如果在载入过程用户改了key就真的没辙了，可以在点击搜索的时候记录
          // 真实的确定key，但是如果用的按钮，我特么连。。。哦onlick可以加。。。费劲啊 麻蛋

          // 如果点了两个一样的，那可能会报key一样的警告，这个不管
          if(json.category && json.category != parseInt(this.props.match.params.id)){
            // console.log(this.props)
            console.log('delay ingore catetory ' + json.category)
            return
          }

          // 这里不能这样写，还要加上本地是否items为空作为因素之一，其实就是因为发的协议发了两次。。。scroll bug啊。。唉，搞事情
          this.show_no_result = json.data.length === 0 && this.state.items.length === 0

          for (let i = 0; i < json.data.length; i++) {
            this.loadItemsDetail(page, json.data[i])
          }
          // this.printCurAllItems()
          this.setState({ items: this.state.items })
          if (json.over) {
            this.setState({ hasMoreItems: false })
          }
        })
        // test
        // this.setState({ hasMoreItems: false })
      } else {
        // console.log('key: ' + key)
        // // search就先全部给了，不分页了
        const newKey = key.trim()
        if(newKey.length <= 0){
          console.log('ingore white space key ')
          return
        }
        this.searchKey = newKey
        const url = `${SERVER_SETTING.url}/search/${newKey}`
        fetch(url).then(resp => {
          // console.log(resp)
          return resp.json()
        }).then(json => {
          if(json.data.length === 0){
            // console.log('what the fuck search ' + newKey)
            this.show_no_result = true
          }else{
            this.show_no_result = false
            this.setState({ items: [] })
            for (let i = 0; i < json.data.length; i++) {
              this.loadItemsDetail(page, json.data[i])
            }
            // 一次性返回全部的结果了
            // this.printCurAllItems()
          }
          this.setState({ items: this.state.items, hasMoreItems: false })
        })
      }
    } else {
      // 根路径,用棋魂还是全部呢...
      // 这里有一个bug，infinite-scroll的bug，第一次引入的时候回调用两次，我应该判断，如果是有数据的，可以，直接往里加，没问题，增量的，如果第二次没有那就不行，所以判断一下hasMore false就不发了
      // 我曹，不行，因为false是在then回调里面，所以只能强行判断了
      // 最后，我还是觉得依赖 this.show_no_result = json.data.length === 0 && this.state.items.length === 0 判断，和上面普通的路由结果保持一致吧
      // if(this.needIgnore){
      //   return
      // }else{
      //   this.needIgnore = true
      // }

      // const indexCategory = 15
      // 0-12, 后面三个不太好...
      const indexCategory = Math.floor(Math.random()*13)
      const url = `${SERVER_SETTING.url}/category/${indexCategory}/${this.state.cat_page++}`
      fetch(url).then(resp => resp.json()).then(json => {
        // console.log("fetch data len " + json.data.length)

        // 根路径没想到好的解决方法。。。先不管吧
        // if(json.category && json.category === indexCategory){
        //   console.log('delay index ingore ' + json.category)
        //   return
        // }
        this.show_no_result = json.data.length === 0 && this.state.items.length === 0


        for (let i = 0; i < json.data.length; i++) {
          this.loadItemsDetail(page, json.data[i])
        }
        // this.printCurAllItems()
        this.setState({ items: this.state.items })
        // console.log("over " + json.over)
        if (json.over) {
          this.setState({ hasMoreItems: false })
        }
      })
    }
    console.log(
      'load page ' + page + ': current item: ' + this.state.items.length
    )
  }

  printCurAllItems() {
    let res = this.state.items
    for (let i = 0; i < res.length; i++) {
      // console.log(res[i])
      // console.log('fuck ' + res[i].key)
    }
    console.log('fuck length: ' + res.length)
  }

  loadItemsDetail(page, detail) {
    let res = this.state.items
    // console.log('load ' + detail.mid)
    res.push(<MangaItem key={detail.mid} data={detail} />)
  }

  render() {
    // console.log('mangaview render')
    // console.log('MangaView render ' + (tis.props.route ? this.props.route.searchKey : "null"))

    let view
    if(this.show_no_result){
      view = (
        <div className="no-result">
          <Col md={3}>
            <Image src="/images/loader.png" />
          </Col>
          <Col md={9}>
          <Col className="no-result-txt">
            <p>
              {'  呜呜，服务器君丧心病狂地搜索...然而并没有到 "' + this.searchKey + '" 的结果 すみません 😭  ' + '由于大陆/台湾/香港译名不一样，可以换个其他译名或者搜索某个词，也可以试试搜搜作者哦 😏'
              + '  如果还没有，大丈夫，可以联系小光的邮箱反馈哟，小光会尽力补上的 😃'}
            </p>
          </Col>
          </Col>
        </div>
      )    
    }else{
      view = this.state.items
    }

    return (
      <Col
        md={8}
        mdOffset={2}
        className="manga-view">
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadItems.bind(this)}
          hasMore={this.state.hasMoreItems}
          // loader={<Loader />} // 用自己的，特么直接进入载入所有数据。。。我服
          loader={
            <div className="loader"><img src="/images/loading.gif" alt="loading" /></div>
          }
          threshold={250}
          style={{ margin: '10px auto' }}
          initialLoad={true}>
          {view}
        </InfiniteScroll>
      </Col>
    )
  }
}

export class Footer extends React.Component {
  render() {
    return (
      <Col md={12} mdOffset={0} className="footer">
        <span>Copyright © 2017 By ShindouHikaru All Rights Reserve</span>
      </Col>
    )
  }
}

class Home extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      searchKey: ''
    }
    // document.title = `魂漫 - 连载的是漫画 永不完结的是童年 - Soul Comic`
    document.title = `魂漫 - Soul Comic`
  }

  componentDidMount() {

  }

  handleSearch() {
    // console.log('search: ' + this.state.searchKey)
    this.setState({ searchKey: this.state.searchKey })
  }

  handleInput(searchKey) {
    this.setState({ searchKey: searchKey })
  }

  render() {
    return (
      <div>
        <Col>
          <SearchBar
            handleSearch={this.handleSearch.bind(this)}
            handleInput={this.handleInput.bind(this)}
            searchKey={this.state.searchKey}
          />
        </Col>
        <CategoryBar />
        <Footer />
      </div>
    )
  }
}

export default class SoulManga extends React.Component {
  // render(){
  //   return(<div className="loader"><img src="/images/loading.gif" /></div>)
  // }

  constructor(props){
    super(props)
    // this.setMeta()
    // document.title = '魂漫 - 连载的是漫画 永不完结的是童年 - Soul Comic'
  }


  setMeta(){
    // const title = '魂漫 - 连载的是漫画 永不完结的是童年 - Soul Comic'
    // $('title').text(title)
    // $('meta[name=keywords]').attr('content', `魂漫 热门连载漫画 免费漫画 高清漫画 在线漫画`)
    // $('meta[name=description]').attr('content', `魂漫是一个专注分享漫画的平台，这里有免费的高清在线漫画，希望每个喜爱看漫画的孩子都能保持一颗看漫画时候的纯真的心。连载的是漫画，永不完结的是童年，永远不变的是初心。`)
  }

  render() {
    // 这就是说这里的出了category之外，其他都是通过target="_self"，来触发的，因为这些Route没有和Link写在一起
    // 神迹了：使用render的写法直接传入属性：https://github.com/ReactTraining/react-router/issues/4105
    // console.log('app name ' + CUR_MANGA_NAME)
    return (
      <Router>
        <div>
          <Logo />
          <Route exact path="/" component={Home} />
          <Route path="/category/*" component={Home} />
          <Route path="/search/:key" component={Home} />
          <Route path="/fuck" component={Home} />
          <Route path="/info/:name" component={MangaInfo} />
          <Route path="/read/:id/:chapter" component={ReadPage} />
        </div>
      </Router>
    )
          // <Route path="/info/:id" component={MangaInfo} />
          // <Route path="/info/:id"  render={props => <MangaInfo name={CUR_MANGA_NAME} {...props} />} />
  }
}

class LogoFluid extends React.Component {
  // render() {
  //   return (
  //     <Image src="/images/sasuke_left.png" className="animated fadeInLeft" />
  //   )
  // }

  render() {
    const text = '魂'
    return (
      <div className="logo-fluid animated fadeInLeft">
        <svg viewBox="0 0 100 20" className="">
          <defs>
            <linearGradient id="gradient1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#F0F8FF" />
              <stop offset="95%" stopColor="#7b68ee" />
            </linearGradient>
            <pattern
              id="wave1"
              x="0"
              y="0"
              width="120"
              height="20"
              patternUnits="userSpaceOnUse">
              <path
                id="wavePath"
                d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
                mask="url(#mask)"
                fill="url(#gradient1)">
                <animateTransform
                  attributeName="transform"
                  begin="0s"
                  dur="1.5s"
                  type="translate"
                  from="0,0"
                  to="40,0"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>
          </defs>
          <text
            textAnchor="start"
            x="50"
            y="20"
            fontSize="26"
            // fontFamily="Microsoft YaHei"
            fontFamily="&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;, &quot;WenQuanYi Micro Hei&quot;, sans-serif"
            fill="url(#wave1)"
            fillOpacity="1.9">
            {text}
          </text>
          <text
            textAnchor="start"
            x="50"
            y="20"
            fontSize="26"
            // fontFamily="Microsoft YaHei"
            fontFamily="&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;,
             &quot;WenQuanYi Micro Hei&quot;, sans-serif"
            fill="url(#gradient1)"
            fillOpacity="0.6">
            {text}
          </text>
        </svg>
        <Image src="/images/sasuke_left.png" />
      </div>
    )
  }
}

class LogoFluid2 extends React.Component {
  render() {
    const text = '漫'
    return (
      <div className="logo-fluid animated fadeInRight">
        <Image
          src="/images/naruto_right.png"
        />
        <svg viewBox="0 0 100 20" >
          {/*<defs>
            <linearGradient id="gradient2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="F0F8FF" />
              <stop offset="95%" stopColor="#7b68ee" />
            </linearGradient>
            <pattern
              id="wave2"
              x="0"
              y="0"
              width="120"
              height="20"
              patternUnits="userSpaceOnUse">
              <path
                id="wavePath"
                d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
                mask="url(#mask)"
                fill="url(#gradient2)">
                <animateTransform
                  attributeName="transform"
                  begin="0s"
                  dur="1.5s"
                  type="translate"
                  from="0,0"
                  to="40,0"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>
          </defs>*/}
          <text
            textAnchor="end"
            x="50"
            y="20"
            fontSize="26"
            fontFamily="&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;, &quot;WenQuanYi Micro Hei&quot;, sans-serif"
            fill="url(#wave1)"
            fillOpacity="1.9">
            {text}
          </text>
          <text
            textAnchor="end"
            x="50"
            y="20"
            fontSize="26"
            fontFamily="&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;, &quot;WenQuanYi Micro Hei&quot;, sans-serif"
            fill="url(#gradient1)"
            fillOpacity="0.6">
            {text}
          </text>
        </svg>
      </div>
    )
  }
}

class LogoText1 extends React.Component {
  animated(){
    // $('.mast').show()
    (function($) {
      var s,
        spanizeLetters = {
          settings: {
            letters: $('.js-spanize1')
          },
          init: function() {
            s = this.settings
            this.bindEvents()
          },
          bindEvents: function() {
            s.letters.html(function(i, el) {
              //spanizeLetters.joinChars();
              var spanizer = $.trim(el).split('')
              return '<span>' + spanizer.join('</span><span>') + '</span>'
            })
          }
        }
      spanizeLetters.init()
    })(jQuery)

    // 只能一次有效。。。嘛，一次就一次吧
    $('.mast').hover(function() {
      $(this).addClass('magictime puffIn')
    })
  }

  componentDidMount() {
    // $('.mast').hide()
    setTimeout(this.animated, 2000)
  }


  render() {
    return (
      // <main>
      (
        <div className="mast">
          <div className="mast__header">
            <p className="mast__title js-spanize1">我们的童年  一直都在</p>
          </div>
        </div>
      )
      // </main>
    )
  }
}



class Logo extends React.Component {

  componentDidMount(){
    // 我这里不能直接像https://coderwall.com/p/nuzcua/how-i-delayed-timed-animate-css-animations里面这样设置css为none，因为我要用flex，所以我先隐藏就好了
    $('.logo-fluid').hide()
    setTimeout(function () {
        // 没必要addClass，可以直接先写好，因为show的时候自动调用动画了
        // $('.logo-fluid').show().addClass('animated ')}, 1500
        $('.logo-fluid').show()
      }, 1500
    )
  }

  render() {
    return (
      <Col className="logo">
        <Col md={9} className="logo-center">
          <Col md={3} mdOffset={0}>
            <LogoFluid />
          </Col>
          <Col md={6} mdOffset={0}>
            <Link to="/" target="_self">
            <Image src="/images/logo.png" className="logo-soul  animated rubberBand" />
            </Link>
          </Col>
          {/* 微调0.1rem，视觉差....鸣人头发太亮了，看着高一些*/}
          <Col md={3} mdOffset={0} style={{ top: '0.1rem' }}>
            <LogoFluid2 />
          </Col>
        </Col>
      </Col>
    )
  }

}


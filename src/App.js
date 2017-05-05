import React, { Component } from 'react'
import './App.css'
// todo: 要放到爬虫层
import Chinese from 'chinese-s2t'
import {
  Button,
  FormControl,
  Glyphicon,
  Form,
  Col,
  Row,
  Nav,
  NavItem,
  Image
} from 'react-bootstrap'
import InfiniteScroll from 'react-infinite-scroller'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import MangaInfo from './manga-info' // ./必须写，不然找不到，可能去node_moudle里
import ReadPage from './read-page'
import ReactDOM from 'react-dom'
import Radium from 'radium'

export const STYLES = {
  border: {
    border: '3px solid aqua'
  },
  searchBar: {
    margin: '100 auto',
    border: '3px solid aqua',
    padding: '10px'
  },
  input: {
    fontSize: 16
    // color:'red'
  },
  categoryBar: {
    margin: 'auto',
    height: 50,
    border: '3px solid cyan',
    top: 20
  },
  navItem: {
    // fontSize: 26,
    // padding: '1rem 2rem',
    fontSize: '1.4rem',
    fontWeight: 500,
    // color: '#ffe484',
    color:'blue',
    borderColor: '#ffe484'
  },
  mangaItem: { border: '3px solid blue',  top: 20 },
  info: { top: 50, border: '3px solid blue' },
  mangaView: {
    position: 'relative',
    top: 0,
    fontColor: 'blue',
    border: '3px solid darkblue',
    height: 300
  }
}

export const SERVER_SETTING = {
  url: 'http://localhost:5000',
  // image: 'http://localhost:5000/static/image'
  image: ''
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: '',
      redirect: false
    }
  }

  handleInput(e) {
    // this.props.handleInput(e.target.value)
    // 自己重绘自己
    this.setState({searchKey: e.target.value})
  }

  handleKeyPress(e){
    if(e.key === 'Enter'){
      console.log('enter')
      this.setState({redirect: true})
    }
  }

  render() {
    if(this.state.redirect){
      console.log('redirect')
      return <Redirect push to={'/search/'+this.state.searchKey} />
    }
    return (
      <Router>
        <Form style={STYLES.searchBar}>
          <Row>
            <Col md={3} mdOffset={4}>
              <FormControl
                type="text"
                placeholder="search here"
                value={this.state.searchKey}
                style={STYLES.input}
                onChange={this.handleInput.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
              />
            </Col>
            <Col>
              <Link to={"/search/"+this.state.searchKey} target="_self">
              <Button bsStyle="primary" bsSize="lg" onClick={this.props.handleSearch} >
                <Glyphicon glyph="search" />
              </Button>
              </Link>
            </Col>
          </Row>
        </Form>
      </Router>
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

  render() {
    // let view = null
    // if(!this.props.searchKey){
    //   view = <Route path="/category/:id" component={MangaView} />
    // }else{
    //   view = <Route path="/search/:key" component={MangaView} />
    // }
    // 尼玛，那个LinkContainer的to如果是'/fuck'，是按钮样式的。。什么鬼，这还会影响啊
    // console.log("categoryBar render")
    return (
      <Router>
        <div style={STYLES.categoryBar}>
          <Col md={8} mdOffset={2}>
            <Nav bsStyle="pills" onSelect={this.handleCatChange} justified>
              {self.categorys.map((v, k) => (
                <LinkContainer key={'cat' + k} to={'/category/' + k}>
                  <NavItem eventKey={'cat' + k} style={STYLES.navItem}>
                    {v}
                  </NavItem>
                </LinkContainer>
              ))}
            </Nav>
          </Col>
          <Route exact path="/" component={MangaView} />
          <Route path="/category/:id" component={MangaView} />
          <Route path="/search/:key" component={MangaView} searchKey={this.searchKey} />
        </div>
      </Router>
    )
          // <Route path="/search/:key" component={MangaView} />
  }

  /*render() {
    return (
      <Router>
        <div style={STYLES.categoryBar}>
          <Col md={4} mdOffset={4}>
            <Nav bsStyle="pills" onSelect={this.handleCatChange}>
              <LinkContainer to="/category/1">
                <NavItem eventKey={1} style={STYLES.navItem}>category1</NavItem>
              </LinkContainer>
              <LinkContainer to="/category/2">
                <NavItem eventKey={2} style={STYLES.navItem}>category2</NavItem>
              </LinkContainer>
              <LinkContainer to="/category/3">
                <NavItem eventKey={3} style={STYLES.navItem}>category3</NavItem>
              </LinkContainer>
              <LinkContainer to="/category/4">
                <NavItem eventKey={4} style={STYLES.navItem}>category4</NavItem>
              </LinkContainer>
              <LinkContainer to="/category/5">
                <NavItem eventKey={5} style={STYLES.navItem}>category5</NavItem>
              </LinkContainer>
            </Nav>
          </Col>

          <Route path="/category/:id" component={MangaView} />
        </div>
      </Router>
    )
  }*/
}

// 本来推荐如果comp里面没有动态的东西的话，应该用箭头格式而不是用类...像router例子里面一样，再说吧
// 应该还是更新MangaView，只不过sql变了
class SearchView extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const key = this.props.match.params.key

  }
}

class MangaItem extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // target='_self'必须要。。为啥？
    return (
      <Router>
        <Col md={2} style={{ textAlign: 'center', }}>
          <Link to={`/info/${this.props.data.mid}`} target="_self">
            <div style={{height: '19rem',  }}>
              <Image
                src={this.props.data.cover_image}
                width={'150rem'}
                height={'190rem'}
                style={{borderRadius:'10px'}}
                // thumbnail
                // responsive
              />
              <div ><p><span style={STYLES.navItem}>{this.props.data.name}</span></p></div>
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
    console.log(this.props.route)
  }

  componentWillReceiveProps(nextProps) {
    // 这个方法应该也不要了...路由对了直接在didmount加载才是正确的做法
    this.setState({ hasMoreItems: true, items: [], cat_page: 0})
    // const key = this.props.match.params.key
  }

  loadItems(page) {
    console.log(this.props)
    // console.log("load page " + page)
    const key = this.props.match.params.key
    // const cat = this.props.match.params.id
    if(this.props.match.params.id || key){
      if(!this.props.match.params.key){
        const url = `${SERVER_SETTING.url}/category/${this.props.match.params.id}/${this.state.cat_page++}`
        fetch(url).then(resp => resp.json()).then(json => {
          // console.log("fetch data len " + json.data.length)
          // todo 有可能延迟回来进入了其他tab，这里需要通过返回category和当前category(nav切换)来判断
          for (let i = 0; i < json.data.length; i++) {
            this.loadItemsDetail(page, json.data[i])
          }
          this.setState({ items: this.state.items })
          // console.log("over " + json.over)
          if (json.over) {
            this.setState({ hasMoreItems: false })
          }
        })
        // test
        // this.setState({ hasMoreItems: false })
      }else{
        // console.log('key: ' + key)
        // search就先全部给了，不分页了
        const url = `${SERVER_SETTING.url}/search/${key}`
        fetch(url).then(resp => resp.json()).then(json => {
          console.log(json)
          this.setState({items: []})
          for (let i = 0; i < json.length; i++) {
            this.loadItemsDetail(page, json[i])
          }
          // 一次性返回全部的结果了
          this.setState({ items: this.state.items, hasMoreItems:false })
        })
      }
    }else{
      // 根路径,用棋魂还是全部呢...
      const url = `${SERVER_SETTING.url}/category/15/${this.state.cat_page++}`
      fetch(url).then(resp => resp.json()).then(json => {
        // console.log("fetch data len " + json.data.length)
        // todo 有可能延迟回来进入了其他tab，这里需要通过返回category和当前category(nav切换)来判断
        for (let i = 0; i < json.data.length; i++) {
          this.loadItemsDetail(page, json.data[i])
        }
        this.setState({ items: this.state.items })
        // console.log("over " + json.over)
        if (json.over === 1 || json.over === '1') {
          this.setState({ hasMoreItems: false })
        }
      })      
    }
  }

  loadItemsDetail(page, detail) {
    let res = this.state.items
    // console.log('load ' + detail.mid)
    res.push(<MangaItem key={detail.mid} data={detail} />)
  }

  render() {
    // console.log('MangaView render ' + (tis.props.route ? this.props.route.searchKey : "null"))
    return (
      <Col md={8} mdOffset={2} style={STYLES.mangaItem}>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadItems.bind(this)}
          hasMore={this.state.hasMoreItems}
          loader={<div className="loader">Loading ...</div>}
          threshold={250}
          style={{margin:'10px auto'}}
          initialLoad={true}>
          {this.state.items}
        </InfiniteScroll>
      </Col>
    )
  }
}


export class Footer extends React.Component {
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

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: ''
    }
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
        <SearchBar
          handleSearch={this.handleSearch.bind(this)}
          handleInput={this.handleInput.bind(this)}
          searchKey={this.state.searchKey}
        />
        <CategoryBar />
      </div>
    )
  }
}

export default class SoulManga extends React.Component {
  render() {
    // 这就是说这里的出了category之外，其他都是通过target="_self"，来触发的，因为这些Route没有和Link写在一起
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/category/*" component={Home} />
          <Route path="/search/:key" component={Home} />
          <Route path="/fuck" component={Home} />
          <Route path="/info/:id" component={MangaInfo} />
          <Route path="/read/:id/chapter/:chapter" component={ReadPage} />
        </div>
      </Router>
    )
  }
}

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <div className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h2>Welcome to React</h2>
//         </div>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

// export default SoulManga;
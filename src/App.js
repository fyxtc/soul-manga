import React, { Component } from "react";
import "./App.css";

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
} from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroller";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import MangaInfo from "./manga-info"; // ./必须写，不然找不到，可能去node_moudle里
import ReadPage from "./read-page";
import ReactDOM from "react-dom";
import Radium from "radium";

export const STYLES = {
  border: {
    border: "3px solid aqua"
  },
  searchBar: {
    margin: "100 auto",
    border: "3px solid aqua",
    padding: "10px"
  },
  input: {
    fontSize: 16
    // color:'red'
  },
  categoryBar: {
    margin: "auto",
    height: 50,
    border: "3px solid cyan",
    top: 20
  },
  navItem: {
    fontSize: 16
  },
  mangaItem: { border: "3px solid blue", margin: "100 auto", top: 50 },
  info: { top: 50, border: "3px solid blue" },
  mangaView: {
    position: "relative",
    top: 0,
    fontColor: "blue",
    border: "3px solid darkblue",
    height: 300
  }
};

export const SERVER_SETTING = {
  url: "http://localhost:5000",
  image: "http://localhost:5000/static/image"
};

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleInput(e) {
    this.props.handleInput(e.target.value);
  }

  render() {
    return (
      <Router>
        <Form style={STYLES.searchBar}>
          <Row>
            <Col md={3} mdOffset={4}>
              <FormControl
                type="text"
                placeholder="search here"
                value={this.props.searchKey}
                style={STYLES.input}
                onChange={this.handleInput.bind(this)}
              />
            </Col>
            <Col>
              <Button bsStyle="primary" bsSize="lg">
                <Glyphicon glyph="search" />
              </Button>
            </Col>
          </Row>
        </Form>
      </Router>
    );
  }
}

class CategoryBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
    );
  }
}

class MangaItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // target='_self'必须要。。为啥？
    return (
      <Router>
        <Col md={2}>
          <Link to={`/info/${this.props.data.id}`} target='_self'>
            <Image
              src={SERVER_SETTING.image + "/" + this.props.data.cover_image}
              thumbnail
              responsive
            />
            <p>{this.props.data.name}</p>
          </Link>
        </Col>
      </Router>
    );
  }
}

class MangaView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMoreItems: true,
      items: [],
      category: 1
    };
  }

  componentWillReceiveProps(nextProps) {
    // 这个方法应该也不要了...路由对了直接在didmount加载才是正确的做法
    this.setState({ hasMoreItems: true, items: [] })
    // this.setState
  }

  loadItems(page) {
    const url = `${SERVER_SETTING.url}/category/${this.props.match.params.id}`;
    fetch(url).then(resp => resp.json()).then(json => {
      for (let i = 0; i < json.length; i++) {
        this.loadItemsDetail(page, json[i]);
      }
      if (json.length === 0) {
        this.setState({ hasMoreItems: false });
      }
    });
    // test
    this.setState({ hasMoreItems: false });
  }

  loadItemsDetail(page, detail) {
    let res = this.state.items;
    res.push(<MangaItem key={detail.id} data={detail} />);
    this.setState({ items: res });
  }

  render() {
    return (
      <Col md={6} mdOffset={3} style={STYLES.mangaItem}>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadItems.bind(this)}
          hasMore={this.state.hasMoreItems}
          loader={<div className="loader">Loading ...</div>}
          threshold={250}
          initialLoad={true}
        >
          {this.state.items}
        </InfiniteScroll>
      </Col>
    );
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKey: ""
    };
  }

  handleSearch() {}

  handleInput(searchKey) {
    this.setState({ searchKey: searchKey });
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
    );
  }
}

export default class SoulManga extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route path='/category/*' component={Home} ></Route>
          <Route path="/info/:id" component={MangaInfo} />
          <Route path="/read/:id/page/:page" component={ReadPage} />
        </div>
      </Router>
    );
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
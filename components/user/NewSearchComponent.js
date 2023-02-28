import React, { Component } from "react";
import axios from "axios";
import ReactTooltip from "react-tooltip";
import SimpleReactValidator from "simple-react-validator";
import { InfiniteScroll } from "react-simple-infinite-scroll";
import { Multiselect } from "multiselect-react-dropdown";
import {
  apiRoute,
  getApiHeader,
  getUserId,
  getLocalStorageAuth,
} from "../../utils/helpers";
import VideoServices from "../../services/videoServices";
import VideoDetails from "../../components/user/VideoDetails";
import Layout from "../../components/user/Layout";
import { SearchContext } from "./ContextSearch";
import Link from "next/link";
import styles from "../../components/user/newsearchcomponent.module.css";

export default class NewSearchComponent extends Component {
  static contextType = SearchContext;
  constructor(props) {
    super(props);
    this.multiselectRef = React.createRef();
    this.showCollections = true
    this.state = {
      dataToVideos: [],
      allVideosCollection: [],
      videos: [],
      teachers: [],
      styleType: [],
      intentions: [],
      styles: [],
      searchInput: "",
      duration: "",
      durationStart: "",
      selectedTeacher: "",
      selectedStyle: "",
      selectedStyleType: "",
      selectedTeacherText: "",
      selectedStyleText: "",
      selectedStyleTypeText: "",
      selectedIntention: [],
      selectedIntentionType: [],
      searchInputOptions: [],
      showFilterForm: false,
      showStyle: false,
      accessDetails: {},
      teacherExclusive: false,
      loading: true,
      hasMore: true,
      cursor: 0,
      totalCount: 0,
      surprisemeVideo: "",
      showVideos: false,
      showTypesFilters: true,
    };
    this.searchValidation = new SimpleReactValidator();
    this.onChange = this.onChange.bind(this);
    this.handleSearchForm = this.handleSearchForm.bind(this);
  }
  fetchSearchVideos = (data, videos, showVideo) => {
    this.setState({ loading: true });
    VideoServices.fetchSearchVideos(data).then((res) => {
      let allVideos = [...videos, ...res.data.videos];
      this.setState({
        videos: allVideos,
        loading: false,
        cursor: res.data.cursor,
        hasMore: res.data.hasMore,
        totalCount: res.data.totalCount,
      });
    });
    // this.state.showVideos == true? this.setState({ showVideos: true }) : false,
    showVideo ? this.setState({ showVideos: true }) : "";
  };
  componentDidMount() {
    let {
      si,
      cFstyle,
      cFstyle2,
      cFilterForm,
      cFteacher,
      cFduration,
      cFintentions,
      cFstyleId,
      cFteacherId,
      cFstyleId2,
      cShowStyle,
      cFintentionsId,
    } = this.context;

    window.scrollTo(0, 0);

    const requestOptions = {
      headers: getApiHeader(true),
    };
    // axios({
    //     method: 'get',
    //     url: apiRoute("get-video-collection-data"),
    //     withCredentials: false,
    //   }, requestOptions).then((res) => {
    //     delete res.data.live_studio;
    //     const dataFromApi = res.data;
    //     this.setState({
    //       allVideosKeys: [...Object.keys(dataFromApi)],
    //       mainVideoCollection: dataFromApi,     
    //     });
    //     console.log(this.state.allVideosCollection);
    //     console.log(this.state.allVideosKeys);
    //   });
    axios
      .get(apiRoute("user-dashboard/get-all-video-teacher"), requestOptions)
      .then((res) => {
        this.setState({ teachers: res.data });
      });
    axios
      .get(apiRoute("user-dashboard/get-all-videos-style"), requestOptions)
      .then((res) => {
        this.setState({ styleType: res.data });
        // changeFstyleId(res.data)
      });
    axios
      .get(apiRoute("user-dashboard/get-all-videos-intention"), requestOptions)
      .then((res) => {
        this.setState({ intentions: res.data });
      });
    if (this.props.exclusive !== undefined) {
      var isteacherExclusive = true;
    } else {
      var isteacherExclusive = false;
    }
    if (this.props.style !== undefined) {
      this.setState({
        selectedStyleType: this.props.style,
        showFilterForm: true,
        showStyle: true,
      });
      const details = {
        searchInput: "",
        duration: "",
        durationStart: "",
        teacher: "",
        styleType: this.props.style,
        intentionType: [],
        style: cFstyleId2,
        teacherExclusive: false,
        limit: 40,
        skip: 0,
      };
      const stateValues = this.state;
      stateValues.selectedStyleType = this.props.style;
      stateValues.showFilterForm = true;
      stateValues.showStyle = true;

      axios
        .get(
          apiRoute("user-dashboard/get-styles/" + this.props.style),
          requestOptions
        )
        .then((res) => {
          this.setState({ styles: res.data });
          stateValues.styles = res.data;
          console.log(res.data);
        });

      this.fetchSearchVideos(details, [], stateValues);
    } else {
      this.setState({
        teacherExclusive: isteacherExclusive,
      });
      if (this.state.videos.length == 0) {
        const details = {
          searchInput: si,
          duration: this.state.duration,
          durationStart: this.state.durationStart,
          teacher: cFteacherId,
          styleType: cFstyleId,
          intentionType: cFintentionsId,
          style: cFstyleId2,
          teacherExclusive: isteacherExclusive,
          limit: 40,
          skip: 0,
        };
        this.fetchSearchVideos(details, []);
      }
    }
    const auth = getLocalStorageAuth();
    if (auth) {
      const userId = auth.userDetails.id;
      axios
        .get(apiRoute("get-teacher-access/" + btoa(userId)), requestOptions)
        .then((res) => {
          this.setState({ accessDetails: res.data });
        });
    }
  }

  surpriseMe = () => {
    const requestOptions = { headers: getApiHeader(true) };
    axios.get(apiRoute("get-surprise-me", requestOptions)).then((res) => {
      console.log(res.data);
      // this.setState({ surprisemeVideo: "https:\/\/player.vimeo.com\/video\/278730789?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=129872" });
      this.setState({ surprisemeVideo: res.data });
    });
  };

  filterData = () => {
    const requestOptions = {
      headers: getApiHeader(true),
    };
    let {
      si,
      cFstyle,
      cFstyle2,
      cFilterForm,
      cFteacher,
      cFduration,
      cFintentions,
      cFstyleId,
      cFteacherId,
      cFstyleId2,
      cFdurationStart,
      cFintentionsId,
    } = this.context;
    const details = {
      searchInput: si,
      duration: cFduration,
      durationStart: cFdurationStart,
      teacher: cFteacherId,
      styleType: cFstyleId,
      intentionType: cFintentionsId,
      style: cFstyleId2,
      teacherExclusive: this.state.teacherExclusive,
      limit: 40,
      skip: 0,
    };
    console.log(details);
    this.fetchSearchVideos(details, [], this.state);
  };

  onSelect = (selectedList, selectedItem) => {
    let { changeFintentions, changeFintentionsId, changeShowCollection } = this.context;
    const selectedIds = [];
    selectedList.forEach((e) => {
      selectedIds.push(e.id);
    });
    this.setState({
      selectedIntention: selectedIds,
      selectedIntentionType: selectedList,
    });
    changeFintentions(selectedList);
    changeFintentionsId(selectedIds);
    changeShowCollection(true);
    setTimeout(() => {
      this.filterData();
    }, 5);
  };

  onRemove = (selectedList, removedItem) => {
    let { changeFintentions, changeFintentionsId } = this.context;
    const selectedIds = [];
    selectedList.forEach((e) => {
      selectedIds.push(e.id);
    });
    var index = selectedIds.indexOf(removedItem);
    if (index > -1) {
      selectedIds.splice(index, 1);
    }
    this.setState({ selectedIntention: selectedIds });
    changeFintentionsId(selectedIds);
    changeFintentions(selectedList);
    setTimeout(() => {
      this.filterData();
    }, 5);
  };

  onChange(e) {
    this.showCollections = false
    let {
      changeFstyle,
      changeFstyle2,
      changeFteacher,
      changeFstyleId,
      changeFteacherId,
      cFstyleId,
      changeFstyleId2,
      changeShowStyle,
      changeStylesData,
      changeShowCollection
    } = this.context;

    const index = e.target.selectedIndex;
    const optionElement = e.target.childNodes[index];
    const selectedName = optionElement.getAttribute("itemName");
    // this.setState({ showVideos: true })

    this.setState({ [e.target.name]: e.target.value });
    setTimeout(() => {
      this.filterData();
    }, 5);

    if (e.target.name === "selectedStyleType") {
      if (e.target.value !== "") {
        this.setState({
          showStyle: true,
          selectedStyle: "",
          selectedStyleTypeText: selectedName,
        });
        changeFstyle(selectedName);
        changeFstyleId(e.target.value);
        changeShowStyle(true);
        changeFstyleId2("");
        changeShowCollection(true);
        console.log(cFstyleId);
        console.log(this.state.styleType);
        const requestOptions = {
          headers: getApiHeader(true),
        };
        axios
          .get(
            apiRoute("user-dashboard/get-styles/" + e.target.value),
            requestOptions
          )
          .then((res) => {
            this.setState({ styles: res.data });
            changeStylesData(res.data);
          });
      } else {
        this.setState({
          showStyle: false,
          styles: [],
          selectedStyle: "",
          selectedStyleTypeText: "",
        });
      }
    }
    if (e.target.name === "selectedStyle") {
      if (e.target.value !== "") {
        this.setState({ selectedStyleText: selectedName });
        changeFstyle2(selectedName);
        changeFstyleId2(e.target.value);
        changeShowCollection(true)
        console.log(e.target.value);
      } else {
        this.setState({ selectedStyleText: "" });
      }
    }
    if (e.target.name === "selectedTeacher") {
      if (e.target.value !== "") {
        this.setState({ selectedTeacherText: selectedName });
        changeFteacher(selectedName);
        changeFteacherId(e.target.value);
        changeShowCollection(true)
      } else {
        this.setState({ selectedTeacherText: "" });
        changeFteacher("");
      }
    }
  }

  handleSearchForm(e) {
    e.preventDefault();
    let { changeShowCollection } = this.context;
    if (!this.searchValidation.allValid()) {
      this.searchValidation.showMessages();
      this.forceUpdate();
      return false;
    }
    changeShowCollection(true)
    this.setState({ searchInputOptions: [] });
    this.filterData();
  }

  toggleFilterForm() {
    let { changeFilterForm } = this.context;
    this.setState({ showFilterForm: !this.state.showFilterForm });
    changeFilterForm(!this.state.showFilterForm);
  }

  changeFinterInput = (e) => {
    let { si, st } = this.context;
    st(e.target.value);
    // this.setState({ searchInput: e.target.value });
    if (e.target.value == '') {
      setTimeout(() => {
        this.filterData();
      }, 10);
    }
  };

  handleSearchOptiopnClick = (e) => {
    let { si, st } = this.context;
    st(e.target.innerHTML);
    this.setState({ searchInputOptions: [] });
  };

  clearAllFilter = (e) => {
    this.showCollections = true
    let {
      changeFteacher,
      st,
      changeFstyle,
      changeFstyle2,
      changeFintentions,
      changeFduration,
      changeFstyleId,
      changeFteacherId,
      changeShowCollection
    } = this.context;
    st("");
    changeFteacher("");
    changeFstyle2("");
    changeFstyle("");
    changeFintentions("");
    changeFduration("");
    changeFstyleId("");
    changeFteacherId("");
    changeShowCollection(false)
    this.setState({
      searchInput: "",
      duration: "",
      durationStart: "",
      selectedTeacher: "",
      selectedStyleType: "",
      selectedTeacherText: "",
      selectedStyleText: "",
      selectedStyleTypeText: "",
      selectedIntention: [],
      selectedStyle: "",
      selectedIntentionType: [],
      allVideosCollection: [],
    });
    if (this.state.selectedIntention.length > 0) {
      this.multiselectRef.current.resetSelectedValues();
    }
    setTimeout(() => {
      this.filterData();
    }, 5);
  };

  clearAllCollectionFilter = () => {
    this.setState({
      showTypesFilters: true,
      allVideosCollection: [],
    });
  };

  loadMore = () => {
    let { si, st } = this.context;

    const details = {
      searchInput: si,
      duration: this.state.duration,
      durationStart: this.state.durationStart,
      teacher: this.state.selectedTeacher,
      styleType: this.state.selectedStyleType,
      intentionType: this.state.selectedIntention,
      style: this.state.selectedStyle,
      teacherExclusive: this.state.teacherExclusive,
      limit: 40,
      skip: this.state.cursor,
    };
    this.fetchSearchVideos(details, this.state.videos);
  };

  onDurationChange = (e) => {
    let { changeFduration, changeFdurationStart, changeShowCollection } = this.context;
    const index = e.target.selectedIndex;
    const optionElement = e.target.childNodes[index];
    const durationStart = optionElement.getAttribute("fromVal");
    this.setState({ duration: e.target.value });
    changeFduration(e.target.value);
    changeFdurationStart(durationStart);
    changeShowCollection(true);
    this.setState({ durationStart: durationStart });
    setTimeout(() => {
      this.filterData();
    }, 8);
  };

  removeStyle = (e) => {
    let { changeFstyle2 } = this.context;
    this.setState({ selectedStyle: "", selectedStyleText: "" });
    changeFstyle2("");
    setTimeout(() => {
      this.filterData();
    }, 8);
  };

  removeStyleType = (e) => {
    let { changeFstyle, changeFstyleId, changeShowStyle } = this.context;
    this.setState({ selectedStyleType: "", selectedStyleTypeText: "" });
    changeFstyle("");
    changeFstyleId("");
    changeShowStyle(false);
    setTimeout(() => {
      this.filterData();
    }, 8);
  };

  removeTeacther = (e) => {
    let { changeFteacher, changeFteacherId } = this.context;
    this.setState({ selectedTeacher: "", selectedTeacherText: "" });
    changeFteacher("");
    changeFteacherId("");
    setTimeout(() => {
      this.filterData();
    }, 8);
  };

  teacherExclusiveVideos = (e) => {
    this.setState({
      teacherExclusive: !this.state.teacherExclusive,
    });
    setTimeout(() => {
      this.filterData();
    }, 8);
  };

  render() {
    let {
      si,
      cFstyle,
      cFstyle2,
      cFilterForm,
      cFteacher,
      cFduration,
      cFintentions,
      cFstyleId,
      cFteacherId,
      cFstyleId2,
      cShowStyle,
      cStylesData,
      cShowCollection,
      cFintentionsId,
    } = this.context;
    console.log(this.context)
    console.log(cShowStyle)
    console.log(this.state.showVideos);
    return (
      <Layout loading={this.state.loading}>
        <main className="admin-content light-purplebg">
          {/* <section
                        className='inner-banner'
                        style={{
                            background: 'url(/../images/bg-connect.jpg)',
                            backgroundSize: 'cover',
                            minHeight: '500px',
                        }}
                    >
                        <div className='container text-center text-white'>
                            <h1>Search all our yoga classes, styles, intentions, teachers, and more.</h1>
                        </div>
                    </section> */}
          <section
            className="inner-banner mb-0"
            style={{
              background: "url(/../images/bg-connect.jpg)",
              backgroundSize: "cover",
              minHeight: "500px",
            }}
          >
            <div className="row" style={{ width: "100%" }}>
              <div
                className="col-md-8 pl-0 pr-0 bannner-box"
                style={{ height: "600px" }}
              >
                <img
                  className="grid-image"
                  src="../../images/search-grid.jpeg"
                  alt=""
                />
              </div>
              <div className="col-md-4 pl-0 pr-0" style={{ height: "600px" }}>
                <div style={{ height: "300px", width: "100%" }}>
                  <img className="grid-image" src="../../images/1.png" alt="" />
                </div>
                <div style={{ height: "300px", width: "100%" }}>
                  <img
                    className="grid-image"
                    src="../../images/live-grid-3.jpg"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="abs-center">
              <div className="text-center text-white">
                <h1 className="revamp-signature-heading mb-0">Yoga Library </h1>
                <p className="revamp-banner-para w-auto">
                  Where You Find All Your Practice Essentials
                </p>
              </div>
            </div>
          </section>
          <section className="sec sec-inabout bg-white">
            <div className="container">
              <div className="row">
                <div className="col-md-12 text-center">
                  <p className="revamp-para">
                    Browse our 1000+ classes on all aspects of Yoga – Asana,
                    Pranayama, Kriya, Mantra, Meditation, Wisdom and more. Yogic
                    Wisdom and Technologies to Elevate Your Consciousness and
                    Transform Your Life. New classes uploaded weekly. Yoga where
                    you are!
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="sec pt-4">
            <div className="blog_outer login_blog">
              <div className="row">
                <div className="col-md-12 pl-50">
                  <div className="row">
                    <div className="col-md-12 mt-5">
                      <h4 className="revamp-subtitle">
                        Browse by Collections
                      </h4>
                    </div>
                    <CollectionSlider />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="email-sec  mb-40 bg-white">
            <div className="blog_outer">
              <div className="row">
                <div className="col-md-12 pl-50">
                  <div className="py-5 h-auto bg-white">
                    <div className="mail">
                      <div>
                        <h3 className="wow fadeInUp flex-1 mb-1">
                          <span className="quote-writer-text black-text mr-2 tilt">
                            Surpise{" "}
                          </span>
                          <span style={{ color: "#5c1c72" }}>me</span>
                        </h3>
                        <p className="revamp-para">
                          See what the moment holds for you.
                        </p>
                      </div>
                      <div className="app-box">
                        <div className="text-right">
                          <button
                            onClick={this.surpriseMe}
                            class="btn btn-sm mw-150 desk-ml-4"
                            data-toggle="modal"
                            data-target="#surpriseme"
                          >
                            Surprise Me
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="sec pt-4">
            <div className="blog_outer login_blog">
              <div className="row">
                <div className="col-md-12 mt-5 pl-50">
                  <h4 className="revamp-subtitle">Browse by filters</h4>
                </div>
                <div className="col-md-12 pl-50 d-flex f-dir align-items-center">
                  <div className="input-field revamp-filter-btn col-md-2 mr-4">
                    <select
                      name="selectedStyleType"
                      onChange={this.onChange}
                      value={cFstyleId}
                    >
                      <option value="">Style</option>
                      {this.state.styleType.map((item, index) => {
                        return (
                          <option
                            itemName={item.type}
                            value={item.id}
                            selected={cFstyleId == item.id ? "selected" : ""}
                          >
                            {item.type}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {cShowStyle && (
                    <div className="input-field revamp-filter-btn col-md-2 mr-4">
                      <select
                        name="selectedStyle"
                        onChange={this.onChange}
                        value={cFstyleId2}
                      >
                        <option value="">Select Class</option>
                        {cStylesData.map((item, index) => {
                          return (
                            <option
                              itemName={item.name}
                              value={item.id}
                              selected={cFstyleId2 == item.id ? "selected" : ""}
                            >
                              {item.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  <div className="input-field revamp-filter-btn col-md-2 mr-4">
                    <select
                      name="selectedTeacher"
                      onChange={this.onChange}
                      value={cFteacherId}
                    >
                      <option value="" selected>
                        Select Teacher
                      </option>
                      {this.state.teachers.map((item, index) => {
                        return (
                          <option
                            itemName={item.name}
                            value={item.id}
                            selected={cFteacherId == item.id ? "selected" : ""}
                          >
                            {item.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="input-field revamp-filter-btn col-md-2 mr-4">
                    <select
                      name="duration"
                      value={cFduration}
                      onChange={this.onDurationChange}
                    >
                      <option value="" selected>
                        Duration
                      </option>
                      <option fromVal={5400} value={7200}>
                        2 Hours
                      </option>
                      <option fromVal={4500} value={5400}>
                        90 Minutes
                      </option>
                      <option fromVal={3600} value={4500}>
                        75 Minutes
                      </option>
                      <option fromVal={2700} value={3600}>
                        60 Minutes
                      </option>
                      <option fromVal={1800} value={2700}>
                        45 Minutes
                      </option>
                      <option fromVal={1200} value={1800}>
                        30 Minutes
                      </option>
                      <option fromVal={900} value={1200}>
                        20 Minutes
                      </option>
                      <option fromVal={600} value={900}>
                        15 Minutes
                      </option>
                      <option fromVal={300} value={600}>
                        10 Minutes
                      </option>
                      <option fromVal={0} value={300}>
                        5 Minutes
                      </option>
                    </select>
                  </div>
                  <div className="input-field revamp-filter-btn col-md-2  ">
                    <button
                      className="btn btn-sm btn-filter mb-4 ml-3"
                      type="button"
                      onClick={this.clearAllFilter}
                      data-html={true}
                      data-for="custom-color-no-arrow"
                      data-tip="Clear all filters"
                    >
                      Clear Filter
                    </button>
                    <ReactTooltip
                      id="custom-color-no-arrow"
                      className="react-tooltip"
                      delayHide={1000}
                      textColor="#FFF"
                      backgroundColor="#000"
                      effect="solid"
                    />
                  </div>
                </div>
                <div className="col-md-12 mt-5 pl-50">
                  <h4 className="revamp-subtitle">Browse by Intentions</h4>
                </div>
                <div className="col-md-12 pl-50 d-flex f-dir align-items-center">
                  <div className="input-field revamp-filter-btn col-md-2  mr-4">
                    {this.state.intentions.length > 0 ? (
                      <Multiselect
                        style={{ backgroundColor: '#fff' }}
                        options={this.state.intentions}
                        onSelect={this.onSelect}
                        onRemove={this.onRemove}
                        selectedValues={cFintentions}
                        displayValue="name"
                        placeholder="Select Intentions"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="col-md-12 pl-50">
                  <>
                    <div className='flex-live'>
                      <h4 className='revamp-subtitle mb-0'> Search result</h4>
                      <div className="searchbar-form-live">
                        <form
                          onSubmit={this.handleSearchForm}
                          className="searchbar-bar d-flex"
                        >
                          <input
                            type="text"
                            placeholder="Find your class"
                            autoComplete="off"
                            name="searchInput"
                            value={si}
                            onChange={this.changeFinterInput}
                            className=" mb-0"
                          />
                          <button
                            className="btn btn-sm mr-2"
                            type="submit"
                          >
                            Search
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className>
                      <h4 className="vid_stat_cnt">
                        <span id="total_rec">{this.state.totalCount}</span>{" "}
                        Videos
                      </h4>
                    </div>
                    <InfiniteScroll
                      throttle={100}
                      threshold={300}
                      isLoading={this.state.loading}
                      hasMore={this.state.hasMore}
                      onLoadMore={this.loadMore}
                    >
                      <div className="row serchVideos">
                        {this.state.videos.map((item, index) => {
                          return <VideoDetails item={item} key={item.id} />;
                        })}
                      </div>
                    </InfiniteScroll>
                    {this.state.videos.length > 0 ? null : (
                      <div className="card-panel text-center sattva-error">
                        <p>
                          No videos found, please try again later, Thank you
                        </p>
                      </div>
                    )}
                  </>
                </div>
                <div
                  class="modal fade"
                  id="surpriseme"
                  tabindex="-1"
                  role="dialog"
                  aria-labelledby="testimonial2Title"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      <div className="modal-body">
                        <iframe
                          className="ifmplayer"
                          src={this.state.surprisemeVideo.video_url}
                          frameborder="0"
                          width="100%"
                          height="400"
                        ></iframe>
                        <h5 class="my-3">{this.state.surprisemeVideo.title}</h5>
                        <div
                          className="surprise-indendation"
                          dangerouslySetInnerHTML={{
                            __html: this.state.surprisemeVideo.description,
                          }}
                        />
                        <a
                          className="btn btn-sm mt-2"
                          href={
                            "/user/video-details/" +
                            this.state.surprisemeVideo.id
                          }
                          target="_blank"
                        >
                          <span>Go to video page</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main >
      </Layout >
    );
  }
}


import dynamic from 'next/dynamic';
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
});
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

export const CollectionSlider = () => {

  return (
    <OwlCarousel
      className='owl-theme collectionCarousel mb-5'
      loop
      margin={30}
      items={4}
      dots={false}
      autoplay={true}
      autoplayTimeout={15000}
      smartSpeed={2000}
      nav
    >
      <Link href={`/user/collection/mindful_movements`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/mindfulMovements.jpg)` }}>
          <h1
            className="quote-writer-text  text-center mb-1"
          >
            Mindful Movements
          </h1>
          <p className={styles.flow}>Vinyasa flow</p>
        </div>
      </Link>

      <Link href={`/user/collection/find_ease`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/FindEase.png)` }}>
          <h1
            className="quote-writer-text text-center mb-1"
          >
            Find Ease
          </h1>
          <p className={styles.flow}>
            Restorative & Sattva Yin
          </p>
        </div>
      </Link>

      <Link href={`/user/collection/deepest_rest`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/DeepestRest.png)` }}>
          <h1
            className="quote-writer-text text-center mb-1"
          >
            Deepest Rest
          </h1>
          <p className={styles.flow}>Yoga Nidra</p>
        </div>
      </Link>

      <Link href={`/user/collection/peaceful_minds`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/PeacefulMinds.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Peaceful Minds
          </h1>
          <p className={styles.flow}>Meditation</p>
        </div>
      </Link>

      <Link href={`/user/collection/live_wholly`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/LiveWholly.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Live Wholly
          </h1>
          <p className={styles.flow}>Integrative Practice</p>
        </div>
      </Link>

      <Link href={`/user/collection/awaken_shakti`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/AwakenShakti.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Awaken Shakti
          </h1>
          <p className={styles.flow}>Himalayan Kundalini</p>
        </div>
      </Link>

      <Link href={`/user/collection/breathe`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/Breathe.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Breathe
          </h1>
          <p className={styles.flow}>Pranayama</p>
        </div>
      </Link>

      <Link href={`/user/collection/sacred_Sound`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/SacredSounds.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Sacred Sound
          </h1>
          <p className={styles.flow}>Mantra</p>
        </div>
      </Link>

      <Link href={`/user/collection/Illuminate`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/Illuminate.jpeg)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Illuminate
          </h1>
          <p className={styles.flow}>Wisdom</p>
        </div>
      </Link>

      <Link href={`/user/collection/live_studio`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
              rgba(208,173,115, 0.9) 90%), url(/images/LiveStudio.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            Live Studio
          </h1>
          <p className={styles.flow}>Recorded Live Classes</p>
        </div>
      </Link>

      <Link href={`/user/collection/sya`}>
        <div className={styles.searchcards} style={{
          backgroundImage: `linear-gradient(180deg, rgba(92,28,114, 0.5),
          rgba(208,173,115, 0.9) 90%), url(/images/SYA.png)` }}>
          <h1 className="quote-writer-text text-center mb-1">
            SYA
          </h1>
          <p className={styles.flow}>Sattva Yoga Academy</p>
        </div>
      </Link>
    </OwlCarousel >
  )
}
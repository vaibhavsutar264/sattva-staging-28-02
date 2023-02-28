import React, { Component } from 'react';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import dynamic from 'next/dynamic';
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
});
import Link from 'next/link';
import {
  apiRoute,
  getApiHeader,
  getUserId,
  getLocalStorageAuth,
} from '../../utils/helpers';

import VideoDetails from '../../components/user/VideoDetails';
import CourseOverView from '../../components/user/course/CourseOverView';
import VideoDetailsMobile from '../../components/user/VideoDetailsMobile';
import CourseOverViewMobile from '../../components/user/course/CourseOverViewMobile';
import Layout from '../../components/user/Layout';
import { SearchContext } from '../../components/user/ContextSearch';
import router from 'next/router';
import styles from "./explore.module.css"
import Head from "next/head";
import { toast } from "react-toastify";

export default class Explore extends Component {
  static contextType = SearchContext;
  constructor(props) {
    super(props);
    this.state = {
      asanaLab: [],
      pranayamaLab: [],
      kriyaLab: [],
      mantraLab: [],
      newlyAdded: [],
      popular: [],
      mostLiked: [],
      mostViewed: [],
      allStyles: [],
      myCourses: [],
      availableCourse: [],
      loading: true,
      accessDetails: [],
      errorMsg: false,
      subscribeMsg: false,
      options: ["New Feature", "New Class", "New Live Event"],
      selectedOptionForReq: ""
    };
    this.onSubscribe = this.onSubscribe.bind(this);
    this.onRequestChangeHandler = this.onRequestChangeHandler.bind(this);
    this.onRequestSubmit = this.onRequestSubmit.bind(this);
  }

  componentDidMount() {
    const userId = getUserId(this.props.history);
    const getId = getLocalStorageAuth();
    if (!getId.userDetails) {
      const ForUrl = router.pathname
      router.push(`/login/?goto=${ForUrl}`);
      return 0;
    }
    const auth = getLocalStorageAuth();
    if (auth) {
      var hasSubscription = auth.userDetails.has_subscription;
    } else {
      var hasSubscription = '0';
    }

    const requestOptions = {
      headers: getApiHeader(true),
    };


    axios
      .get(apiRoute('get-teacher-access/' + btoa(userId)), requestOptions)
      .then((res) => {
        this.setState({ accessDetails: res.data });
      });

    axios
      .get(
        apiRoute('user-dashboard/get-style-videos/' + 4 + '/' + 0 + '/' + 4),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          this.setState({ asanaLab: res.data.videos });
        }
        this.setState({ loading: false });
      })
      .catch((error) => {
        this.setState({ loading: false });
      });

    axios
      .get(
        apiRoute('user-dashboard/get-style-videos/' + 5 + '/' + 0 + '/' + 4),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          this.setState({ pranayamaLab: res.data.videos });
        }
      });

    axios
      .get(
        apiRoute('user-dashboard/get-style-videos/' + 7 + '/' + 0 + '/' + 4),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          this.setState({ kriyaLab: res.data.videos });
        }
      });

    axios
      .get(
        apiRoute('user-dashboard/get-style-videos/' + 11 + '/' + 0 + '/' + 4),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          this.setState({ mantraLab: res.data.videos });
        }
      });

    axios
      .get(
        apiRoute('get-most-saved-videos'),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          const mostPopularData = res.data.most_saved_videos.slice(0, 4)
          this.setState({ popular:  mostPopularData});
        }
      });
    axios
      .get(
        apiRoute('get-most-viewed-videos'),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          const mostViewedData = res.data.most_viewed_videos.slice(0, 4)
          this.setState({ mostViewed: mostViewedData });
        }
      });
    axios
      .get(
        apiRoute('get-most-liked-videos'),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          const mostLikeedData = res.data.most_liked_videos.slice(0, 4)
          this.setState({ mostLiked: mostLikeedData });
        }
      });
 
      axios
      .get(
        apiRoute('user-dashboard/get-all-videos/' + 0 + '/' + 4),
        requestOptions
      )
      .then((res) => {
        if (res.data) {
          this.setState({ newlyAdded: res.data.videos });
        }
      });

    axios
      .get(apiRoute('user-dashboard/get-all-videos-style'), requestOptions)
      .then((res) => {
        if (res.data) {
          this.setState({ allStyles: res.data });
        }
      });
    axios
      .get(apiRoute('my-courses/' + userId + '/' + 0), requestOptions)
      .then((res) => {
        if (hasSubscription == '1') {
          let allCourses = [...res.data.courses, ...res.data.freeCourses];
          var myAllCourses = allCourses.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
          );
        } else {
          let allCourses = res.data.courses;
          var myAllCourses = allCourses.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
          );
        }
        this.setState({ myCourses: myAllCourses });
      });

    axios
      .get(
        apiRoute('user-available-courses/' + userId + '/' + 0),
        requestOptions
      )
      .then((res) => {
        if (hasSubscription == '1') {
          var myArray = res.data.courses;
          var toRemove = res.data.freeCourses;
          for (var i = myArray.length - 1; i >= 0; i--) {
            for (var j = 0; j < toRemove.length; j++) {
              if (myArray[i] && myArray[i].id === toRemove[j].id) {
                myArray.splice(i, 1);
              }
            }
          }
          console.log(myArray);
          var allAvailableCourse = myArray;
        } else {
          var allAvailableCourse = res.data.courses;
        }
        this.setState({ availableCourse: allAvailableCourse });
      });


    let { si, st } = this.context;
    st('');

    window.scrollTo(0, 0);
  }
  getShortWord = (str) => {
    var matches = str.match(/\b(\w)/g);
    var acronym = matches.join('');
    return acronym;
  };

  onSubscribe = (e) => {
    e.preventDefault();
    axios.get(apiRoute(`mailchimp-subscribe/${e.target.email.value}`))
      .then(function (response) {
        if (response.data.id) {
          this.setState({ subscribeMsg: "Thanks For subscribing" });
          this.setState({ errorMsg: true });
          setTimeout(function () {
            this.setState({ errorMsg: false });;
          }, 4000);
        }
        else {
          this.setState({ subscribeMsg: "You are already subscribed thank you !" });
          this.setState({ errorMsg: true });
          setTimeout(function () {
            this.setState({ errorMsg: false });;
          }, 4000);
          // SetErrorMsg(true);
          // setTimeout(function(){
          //   SetErrorMsg(false);
          //  }, 4000);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

  }

  onRequestChangeHandler = (e) => {
    this.setState({
      selectedOptionForReq: e.target.value
    })
  }
  onRequestSubmit = async (e) => {
    e.preventDefault()
    const textAreaInputvalue = document.getElementById("user-requirement")
    console.log(this.state.selectedOptionForReq);
    console.log(textAreaInputvalue && textAreaInputvalue.value);
    const authData = localStorage.getItem('auth')
    console.log(JSON.parse(localStorage.getItem('auth')).userDetails.id);
    console.log(JSON.parse(localStorage.getItem('auth')).userDetails.username);
    // console.log(localStorage.getItem('auth'));




  //   {
  //     user_id: 11211,
  //     username: "vaibhav",
  //     request_type:"New Class",
  //     description:"dcdcd  cdcdc  dcdddddd  dcdcdcd  ddd d  ccccccccccccccc" 
  // }
    const config = { headers: { "Content-Type": "application/json" } };

    const requestOptions = {
      headers: getApiHeader(),
    };
    
    axios.post(apiRoute('make-a-wish'),{
      user_id: JSON.parse(localStorage.getItem('auth')).userDetails.id,
      username: JSON.parse(localStorage.getItem('auth')).userDetails.username,
      request_type: this.state.selectedOptionForReq,
      description: textAreaInputvalue && textAreaInputvalue.value
    },requestOptions)
      .then(function (response) {

        if (response.data) {
           toast(JSON.stringify(response.data.message))
          }
        console.log(response);
        // if (response.data.id) {
        //   this.setState({ subscribeMsg: "Thanks For subscribing" });
        //   this.setState({ errorMsg: true });
        //   setTimeout(function () {
        //     this.setState({ errorMsg: false });;
        //   }, 4000);
        // }
        // else {
        //   this.setState({ subscribeMsg: "You are already subscribed thank you !" });
        //   this.setState({ errorMsg: true });
        //   setTimeout(function () {
        //     this.setState({ errorMsg: false });;
        //   }, 4000);
        //   // SetErrorMsg(true);
        //   // setTimeout(function(){
        //   //   SetErrorMsg(false);
        //   //  }, 4000);
        // }
      })
      .catch(function (error) {
        console.log(error);
      });

    console.log("Request submitted");
  }

  render() {
    return (
      <Layout loading={this.state.loading}>
        <main className='admin-content light-purplebg'>
        <section
            className="inner-banner mb-0"
            style={{
              background: "url(/../images/15.png)",
              backgroundSize: "cover",
              minHeight: "500px",
            }}
          >
            <Head>
              <script
                src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.1/jquery.min.js"
                integrity="sha512-aVKKRRi/Q/YV+4mjoKBsE4x3H+BkegoM/em46NNlCqNTmUYADjBbeNefNxYV7giUp0VxICtqdrbqU7iVaeZNXA=="
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
              ></script>
            </Head>
            <div className="container text-center text-white">
              <h1 className="revamp-signature-heading mb-0">
                Explore
              </h1>
              <p className="revamp-banner-para">Sattva Connect Platform Essentials</p>
            </div>
          </section>
          <section className="sec sec-inabout bg-white">
            <div className="container">
              <div className="row">
                <div className="col-md-12 text-center">
                  <p className="revamp-para">
                  Discover the Yoga Essentials, our most popular, viewed and liked classes, the latest uploads and connect with our global sangha - your online yoga community.
                  </p>
                  <div className="text-center">
                    <Link href="/user/search">
                      <a className="btn btn-sm">Tips</a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className='blog_outer login_blog pb-0'>
            <div className="row">
              <div className="col-md-12 mt-5 pl-50">
                <h4 className="revamp-subtitle">
                  Yoga Essentials
                </h4>
              </div>
              <div className="col-md-3 pl-50">
                <Link href='/user/asana-lab'>
                  <div className={styles.searchcards}>
                    <h1
                      className="quote-writer-text black-text text-center mb-3"
                    >
                      Asana Lab
                    </h1>
                  </div>
                </Link>
              </div>
              <div className="col-md-3">
                <Link href='/user/prayanama-lab'>
                  <div className={styles.searchcards}>
                    <h1
                      className="quote-writer-text black-text text-center mb-3"
                    >
                      Pranayama Lab
                    </h1>
                  </div>
                </Link>
              </div>
              <div className="col-md-3">
                <Link href='/user/kriya-lab'>
                  <div className={styles.searchcards}>
                    <h1
                      className="quote-writer-text black-text text-center mb-3"
                    >
                      Kriya Lab
                    </h1>
                  </div>
                </Link>
              </div>
              <div className="col-md-3">
                <Link href='/user/mantra-lab'>
                  <div className={styles.searchcards}>
                    <h1
                      className="quote-writer-text black-text text-center mb-3"
                    >
                      Mantra Lab
                    </h1>
                  </div>
                </Link>
              </div>
            </div>
          </section>
          <section className=" sec-members text-center">
            <div className="quote-container">
              <div className="quote-box">
                <div className="quote-text-box">
                  <p className="quote-text">
                    <img className="pr-10" src="/images/quote-left.svg" />
                    Any practice is ultimately <br />
                    only as good as the practitioner
                    <img className="pl-10" src="/images/quote-right.svg" />
                  </p>
                </div>
                <div className="quote-writer">
                  <h5 className="quote-writer-text">-Anand Mehrotra</h5>
                </div>
              </div>
            </div>
          </section>
          <section className="blog_outer login_blog pb-0">
            <div className='row'>
              <div className='class-block pl-50'>
                <h4 className=' revamp-subtitle'>Popular</h4>
                <div className='row'>
                  {this.state.popular && this.state.popular.map((item, index) => {
                    return <VideoDetails item={item} key={item.id} />;
                  })}
                </div>
                {this.state.popular.length > 3 ? (
                  <div className='text-right'>
                    <Link className='btn btn-sm' href='/user/popular'>
                      <a className='btn btn-sm'>View All</a>
                    </Link>
                  </div>
                ) : ""}
                {this.state.popular.length == 0 ? (
                  <div className='card-panel valign-wrapper grey lighten-4'>
                    <div className='row'>
                      <div className='col-xl-8 col-lg-8 col-md-8 col-sm-12 text-center'>
                        No data found in this category.
                      </div>
                      <div className='col-xl-4 col-lg-4 col-md-4 col-sm-12 mt-md-0 mt-3 text-center'>
                        <Link className='btn btn-sm' href='/user/search'>
                          <a className='btn btn-sm'>Discover Now</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : ""}
              </div>
            </div>
          </section>
          <section className="blog_outer login_blog pb-0">
            <div className='row'>
              <div className='class-block pl-50'>
                <h4 className=' revamp-subtitle'>Most Viewed</h4>
                <div className='row'>
                  {this.state.mostViewed && this.state.mostViewed.map((item, index) => {
                    return <VideoDetails item={item} key={item.id} />;
                  })}
                </div>
                {this.state.mostViewed.length > 3 ? (
                  <div className='text-right'>
                    <Link className='btn btn-sm' href='/user/most-viewed'>
                      <a className='btn btn-sm'>View All</a>
                    </Link>
                  </div>
                ) : ""}
                {this.state.mostViewed.length == 0 ? (
                  <div className='card-panel valign-wrapper grey lighten-4'>
                    <div className='row'>
                      <div className='col-xl-8 col-lg-8 col-md-8 col-sm-12 text-center'>
                        No data found in this category.
                      </div>
                      <div className='col-xl-4 col-lg-4 col-md-4 col-sm-12 mt-md-0 mt-3 text-center'>
                        <Link className='btn btn-sm' href='/user/search'>
                          <a className='btn btn-sm'>Discover Now</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : ""}
              </div>
            </div>
          </section>
          <section className="blog_outer login_blog pb-0">
            <div className='row'>
              <div className='class-block pl-50'>
                <h4 className=' revamp-subtitle'>Most Liked</h4>
                <div className='row'>
                  {this.state.mostLiked && this.state.mostLiked.map((item, index) => {
                    return <VideoDetails item={item} key={item.id} />;
                  })}
                </div>
                {this.state.mostLiked.length > 3 ? (
                  <div className='text-right'>
                    <Link className='btn btn-sm' href='/user/most-liked'>
                      <a className='btn btn-sm'>View All</a>
                    </Link>
                  </div>
                ) : ""}
                {this.state.mostLiked.length == 0 ? (
                  <div className='card-panel valign-wrapper grey lighten-4'>
                    <div className='row'>
                      <div className='col-xl-8 col-lg-8 col-md-8 col-sm-12 text-center'>
                        No data found in this category.
                      </div>
                      <div className='col-xl-4 col-lg-4 col-md-4 col-sm-12 mt-md-0 mt-3 text-center'>
                        <Link className='btn btn-sm' href='/user/search'>
                          <a className='btn btn-sm'>Discover Now</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : ""}
              </div>
            </div>
          </section>
          <section className="blog_outer login_blog pb-0">
            <div className='row'>
              <div className='class-block pl-50'>
                <h4 className=' revamp-subtitle'>Latest Uploads</h4>
                <div className='row'>
                  {this.state.newlyAdded && this.state.newlyAdded.map((item, index) => {
                    return <VideoDetails item={item} key={item.id} />;
                  })}
                </div>
                {this.state.newlyAdded.length > 3 ? (
                  <div className='text-right'>
                    <Link className='btn btn-sm' href='/user/new-videos'>
                      <a className='btn btn-sm'>View All</a>
                    </Link>
                  </div>
                ) : ""}
                {this.state.newlyAdded.length == 0 ? (
                  <div className='card-panel valign-wrapper grey lighten-4'>
                    <div className='row'>
                      <div className='col-xl-8 col-lg-8 col-md-8 col-sm-12 text-center'>
                        No data found in this category.
                      </div>
                      <div className='col-xl-4 col-lg-4 col-md-4 col-sm-12 mt-md-0 mt-3 text-center'>
                        <Link className='btn btn-sm' href='/user/search'>
                          <a className='btn btn-sm'>Discover Now</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : ""}
              </div>
            </div>
          </section>
          <section className=" sec-members text-center">
            <div className="quote-container">
              <div className="quote-box">
                <div className="quote-text-box">
                  <p className="quote-text">
                    <img className="pr-10" src="/images/quote-left.svg" />
                    Any practice is ultimately <br />
                    only as good as the practitioner
                    <img className="pl-10" src="/images/quote-right.svg" />
                  </p>
                </div>
                <div className="quote-writer">
                  <h5 className="quote-writer-text">-Anand Mehrotra</h5>
                </div>
              </div>
            </div>
          </section>    
          <section className='blog_outer login_blog'>
            <div className="row">
              <div className="col-md-12 mt-5 pl-50">
                <h4 className="revamp-subtitle">
                  Sangha
                </h4>
                <p className='revamp-para text-center'>Connect in your online community</p>
              </div>
              <div className='col-lg-12 col-md-12 col-sm-12 text-center'>
                  <ul className='socillink-block'>
                    <li>
                      <a target='_blank' href='https://www.facebook.com/sattvaconnect/'>
                        <i className='fa fa-facebook' aria-hidden='true'></i>
                      </a>
                    </li>
                    
                    <li>
                      <a target='_blank' href='https://www.instagram.com/sattvaconnect/' >
                        <i className='fab fa-instagram' aria-hidden='true'></i>
                      </a>
                    </li>
                    {/* <li>
                      <a target='_blank' href='https://in.linkedin.com/in/sattvaconnect' >
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </li> */}
                    <li>
                      <a target='_blank' href='https://www.pinterest.com/sattvaconnect/' >
                        {/* <i className='fab fa-instagram' aria-hidden='true'></i> */}
                        <i className="fab fa-pinterest"></i>
                      </a>
                    </li>
                    <li>
                      <a target='_blank' href='https://twitter.com/SattvaConnect' >
                        {/* <i className='fab fa-instagram' aria-hidden='true'></i> */}
                        <i className="fab fa-twitter"></i>
                      </a>
                    </li>
                  </ul>
                </div>
            </div>
          </section>
          <section className="blog_outer login_blog pb-0">
            <div className='row '>
              <div className='col-lg-12 col-md-12 col-sm-12 pl-50 py-5'>
                <div className="col-lg-6 put-field revamp-filter-btn col-md-2 mb-5">
                  <h4 className=' revamp-subtitle'>Make a wish</h4>
                  <form onSubmit={this.onRequestSubmit}>
                    <select style={{ width: '97%' }} onChange={this.onRequestChangeHandler}>
                      <option>Please Choose Request</option>
                      {this.state.options.map((option, index) => {
                        return <option key={index} >
                          {option}
                        </option>
                      })}
                    </select>
                    <textarea style={{ backgroundColor: "white" }} id="user-requirement" rows="4" cols="40">
                    </textarea>
                    {/* <button type='submit'>Submit Requirement</button> */}
                    <button
                      type='submit'
                      className="submit wow fadeInUp btn btn-sm"
                      id="mc-embedded-subscribe"
                    >
                      Submit Requirement
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </section>
          {this.state.errorMsg &&
            <div className="col-5">
              <div className="alert alert-danger" role="alert">
                {this.state.subscribeMsg}
              </div>
            </div>
          }
        </main>
      </Layout>
    );
  }
}




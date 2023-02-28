import React, { Component } from 'react';
import Link from 'next/link';
import VideoServices from '../../services/videoServices';
import VideoDetails from '../../components/user/VideoDetails';
import Layout from '../../components/user/Layout';

class MostLiked extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      isloading: true,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    VideoServices.fetchFavouriteVideos().then((res) => {
        const mostSavedData = res.data.most_saved_videos.slice(0, 50)
      this.setState({
        videos: mostSavedData,
        isloading: false,
      });
    });
  }
  render() {
    const { isloading } = this.state;
    return (
      <>
        <Layout loading={isloading}>
          <main className='admin-content'>
            <div className='sec sec-style'>
              <div className='container'>
                <div className='class-block mt-0'>
                  <div className='row'>
                    <div className='col-md-6 col'>
                      <h4>Favorite Videos</h4>
                    </div>
                    <div className='col-md-6 col text-right'>
                      <Link href='/user/explore'>
                        <a className='btn btn-sm'>Back</a>
                      </Link>
                    </div>
                  </div>

                  <div className='row'>
                    {this.state.videos.map((item, index) => {
                      return <VideoDetails item={item} key={item.id} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Layout>
      </>
    );
  }
}

export default MostLiked;

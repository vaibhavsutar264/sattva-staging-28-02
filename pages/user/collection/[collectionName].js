import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { InfiniteScroll } from 'react-simple-infinite-scroll';
import Layout from '../../../components/user/Layout'
import VideoDetails from '../../../components/user/VideoDetails';
import { apiRoute, getApiHeader, getLocalStorageAuth } from '../../../utils/helpers'

const collection = ({ collectionName }) => {
    console.log(collectionName)
    const [collectionVideos, setCollectionVideos] = useState()
    const [loading, setLoading] = useState(false);
    // const auth = getLocalStorageAuth();
    useEffect(() => {
        const auth = getLocalStorageAuth();
        if (auth) {
            const requestOptions = {
                headers: getApiHeader(),
            };
            console.log(requestOptions)
            const fetchVideos = async () => {
                setLoading(true);
                await axios.get(apiRoute("get-video-collection-data"), requestOptions).then((res) => {
                    delete res.data.live_studio;
                    const dataFromApi = res.data;
                    setCollectionVideos(dataFromApi[collectionName])
                    setLoading(false)
                }).catch(e => {
                    console.log(e);
                    setLoading(false);
                });
            }
            fetchVideos();
        }
    }, [])

    const Capitalize = (str) => {
        const cleanString = str.replace(/_/g, ' ')
        const capsArray = []
        let capitalize;
        cleanString.split(' ').map((str) => {
            const caps = str[0].toUpperCase();
            capsArray.push(str.replace(str[0], caps))
        })
        capitalize = capsArray.join(' ');
        return capitalize
    }

    Capitalize('mindful_movements')
    return (
        <>
            <Layout loading={loading}>
                <main className="admin-content light-purplebg">
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
                                <h1 className="revamp-signature-heading mb-0">{Capitalize(collectionName)}</h1>
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
                            <div className='row'>
                                <div className='col-md-12 pl-50'>
                                    <h4 className="revamp-subtitle mt-3 mb-0">Collection: {Capitalize(collectionName)}</h4>
                                    <div className>
                                        <h4 className="vid_stat_cnt">
                                            <span id="total_rec">{collectionVideos?.length}</span> Videos
                                        </h4>
                                    </div>
                                    <InfiniteScroll
                                        throttle={100}
                                        threshold={300}
                                    >
                                        <div className='row serchVideos'>
                                            {collectionVideos && collectionVideos.map((item, index) => {
                                                return <VideoDetails item={item} key={item.id} />
                                            })}
                                        </div>
                                    </InfiniteScroll>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

            </Layout>
        </>

    )
}
export const getServerSideProps = async ({ params }) => {
    const { collectionName } = params;
    console.log(collectionName)
    return {
        props: { collectionName },
    };
};
export default collection
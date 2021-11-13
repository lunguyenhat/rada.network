import React from "react";
import ContentLoader from "react-content-loader";
import Link from "next/link";
export const NewsLoader = (props) => (
  <div className={`card card-post`}>
    <div className={`card-body`}>
      <ContentLoader
        speed={2}
        backgroundColor="#9CA3AF"
        foregroundColor="#E5E7EB"
        style={{ opacity: "20%" }}
        viewBox="0 0 380 100"
        {...props}
      >
        <rect x="0" y="0" rx="3" ry="3" width="40" height="40" />
        <rect x="48" y="8" rx="3" ry="3" width="128" height="6" />
        <rect x="48" y="24" rx="3" ry="3" width="80" height="6" />
        <rect x="48" y="56" rx="3" ry="3" width="360" height="6" />
        <rect x="48" y="71" rx="3" ry="3" width="380" height="6" />
        <rect x="48" y="88" rx="3" ry="3" width="178" height="6" />
      </ContentLoader>
    </div>
  </div>
);
export const ConceptCardPost = ({ title, mediaUri, type, source, commentCount, voteCount }) => {
  return (
    <Link href={"#"}>
      <div className={`card card-post hasVote hasComment`}>
        <div className={`card-media`}>
          <div className={`card-media-img`}>
            <a className="" href={"/"}>
              <img className={`card-img`} src={mediaUri} alt={""} />
            </a>
          </div>
        </div>

        <div className={`card-body`}>
          <div className={`card-title`}>
            <a className="card-link group" href={"/"}>
              <span className="badge badge-rada">RADA</span>
              <span className="text-color-title mr-2">{title}</span>
            </a>
          </div>

          <div className="metadata-wrapper justify-between mt-1">
            <div className="flex flex-shrink-0">
              <div className="metadata metadata-source">
                <span className="icon icon-rada mr-1.5">
                  <svg className="rada-svg" viewBox="4 4 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path
                      className="inline-rec"
                      d="M18 11.1547C19.2376 10.4402 20.7624 10.4402 22 11.1547L26.6603 13.8453C27.8979 14.5598 28.6603 15.8803 28.6603 17.3094V22.6906C28.6603 24.1197 27.8979 25.4402 26.6603 26.1547L22 28.8453C20.7624 29.5598 19.2376 29.5598 18 28.8453L13.3397 26.1547C12.1021 25.4402 11.3397 24.1197 11.3397 22.6906V17.3094C11.3397 15.8803 12.1021 14.5598 13.3397 13.8453L18 11.1547Z"
                      fill="#374151"
                    />
                    <path
                      className="inline-stroke"
                      d="M20 2L20.8806 15.1519C20.9757 16.5717 22.4811 17.4409 23.7582 16.8133L35.5885 11L24.6389 18.3386C23.4568 19.1308 23.4568 20.8692 24.6389 21.6614L35.5885 29L23.7582 23.1867C22.4811 22.5591 20.9757 23.4283 20.8806 24.848L20 38L19.1194 24.8481C19.0243 23.4283 17.5189 22.5591 16.2418 23.1867L4.41154 29L15.3611 21.6614C16.5432 20.8692 16.5432 19.1308 15.3611 18.3386L4.41154 11L16.2418 16.8133C17.5189 17.4409 19.0243 16.5717 19.1194 15.152L20 2Z"
                      fill="#fff"
                    />
                    <circle className="inline-circle" cx="20" cy="7" r="3" fill="#9CA3AF" />
                    <circle className="inline-circle" cx="20" cy="33" r="3" fill="#9CA3AF" />
                    <circle
                      className="inline-circle"
                      cx="31.2583"
                      cy="13.5"
                      r="3"
                      transform="rotate(60 31.2583 13.5)"
                      fill="#9CA3AF"
                    />
                    <circle
                      className="inline-circle"
                      cx="8.74167"
                      cy="26.5"
                      r="3"
                      transform="rotate(60 8.74167 26.5)"
                      fill="#9CA3AF"
                    />
                    <circle
                      className="inline-circle"
                      cx="8.74167"
                      cy="13.5"
                      r="3"
                      transform="rotate(-60 8.74167 13.5)"
                      fill="#9CA3AF"
                    />
                    <circle
                      className="inline-circle"
                      cx="31.2583"
                      cy="26.5"
                      r="3"
                      transform="rotate(-60 31.2583 26.5)"
                      fill="#9CA3AF"
                    />
                  </svg>
                </span>
                <span className="metadata-value" title={source}>
                  {source}
                </span>
              </div>
              <div className="metadata metadata-date">
                <span className="metadata-value" title="9:2 PM - Jul 15, 2021">
                  13h
                </span>
              </div>
            </div>

            <div className="flex flex-shrink-0 metadata-wrapper_nodivide">
              <div className="metadata metadata-commentcount">
                <span className="icon mr-1.5">
                  <i className="fa fa-comment" />
                </span>
                <span className="">{commentCount}</span>
              </div>
              <div className="metadata metadata-votecount">
                <span className="icon mr-1.5">
                  <i className="fa fa-arrow-up" />
                </span>
                <span>{voteCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

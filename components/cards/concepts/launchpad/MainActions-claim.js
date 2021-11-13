import ProjectTimeline from "../../../concepts/steps/projectTimeline";
import SwapTokens from "../../../concepts/modules/swapTokens";
import Winners from "./Winners";
const MainActions = ({}) => {
  return (
    <>
      <div className="card-default project-main-actions no-padding overflow-hidden">
        <div className="card-body no-padding">
          <div className="flex flex-col">
            <div className="">
              <ProjectTimeline step="3" />
            </div>

            <div className="global-padding-lg !px-6 min-h-full w-full mx-auto">
              <div className="max-w-md mx-auto">
                <ul className="mb-4 mt-auto flex-shrink-0 flex-grow">
                  <li className="list-pair mb-2">
                    <span className="list-key !opacity-100">Bạn có thể rút về ví</span>
                    <div className="ml-auto list-value font-semibold">
                      6,000 PRL
                      <button className="btn-primary py-2 px-4 rounded-md ml-2">Rút token</button>
                    </div>
                  </li>
                </ul>

                <div className="box p-4">
                  <div className="flex items-baseline border-b pb-2  border-gray-200 dark:border-gray-800">
                    <h4 className="text-md items-baseline font-semibold">Bạn đã rút</h4>
                    <span className="ml-auto font-semibold">2,500 PRL</span>
                  </div>
                  <ul className="mb-0 mt-auto flex-shrink-0 flex-grow">
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="list-key text-semibold !text-gray-800 dark:!text-gray-200">
                        <span className="dark:text-gray-400 text-gray-700 mr-1">on</span>
                        <date>15 tháng 9, 2021</date>
                      </span>
                      <div className="ml-auto font-semibold list-value">2,500 PRL</div>
                    </li>
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="list-key text-semibold !text-gray-800 dark:!text-gray-200">
                        <span className="dark:text-gray-400 dark-gray-700 mr-1">on</span>
                        <date>01 tháng 9, 2021</date>
                      </span>
                      <div className="ml-auto font-semibold list-value">2,500 PRL</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-default project-main-actions no-padding overflow-hidden mt-4">
        <div className="card-header items-center">
          <h3>Winners (1000)</h3>
          <div className="search-wrapper">
            <div className="form-search rounded-full">
              <span className="icon form-search--icon">
                <i className="fa fa-search"></i>
              </span>
              <input
                type="text"
                value=""
                className="form-search--input"
                placeholder="Search for winner"
              />
            </div>
          </div>
        </div>

        <div className="card-body no-padding">
          <div className="flex flex-col">
            <div className="global-padding-lg min-h-full">
              <div className="">
                <Winners />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainActions;

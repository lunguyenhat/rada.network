import Subscriber from "./Subscriber";
import Timeline from "./Timeline";
import SwapTokens from "./SwapToken";
import { useERC20 } from "@utils/hooks/useContracts";
import { useEffect, useState } from "react";
import useActiveWeb3React from "@utils/hooks/useActiveWeb3React";
import { utils } from "ethers";
const SubscribeSwapToken = ({ project }) => {
  const rirContract = useERC20(project.launchpadInfo.rirAddress);
  const bUSDContract = useERC20(project.launchpadInfo.bUSDAddress);
  const { account } = useActiveWeb3React();
  const [accountBalance, setAccountBalance] = useState({});
  useEffect(() => {
    const fetchAccountBalance = async function () {
      let rirBalance = await rirContract.balanceOf(account);
      let busdBalance = await bUSDContract.balanceOf(account);
      setAccountBalance({
        rirBalance: utils.formatEther(rirBalance),
        busdBalance: utils.formatEther(busdBalance),
      });
    };
    fetchAccountBalance();
  }, [rirContract, account]);
  return (
    <>
      <div className="card-default project-main-actions no-padding overflow-hidden">
        <div className="card-header text-center sr-only">
          <h3>Public Sale</h3>
        </div>

        <div className="card-body no-padding">
          <div className="flex flex-col">
            <div className="">
              <Timeline step="2" />
            </div>

            <div className="global-padding-lg !px-6 min-h-full w-full mx-auto">
              <div className="mb-8 sr-only">
                <h3 className="text-3xl text-center font-normal">
                  <span className="text-color-title">Chuyển đổi Token</span>
                </h3>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="box box--transparent">
                  <div className="box-header !px-0">Quyền mua của bạn</div>

                  <ul className="mt-4 flex-shrink-0 flex-grow">
                    <li className="list-pair mb-2">
                      <span className="list-key">Quyền mua tối đa</span>
                      <span className="ml-auto list-value font-semibold">
                        {project.launchpadInfo.individualMaximumAmount} USDT ({" "}
                        {project.launchpadInfo.individualMaximumAmount / 100} RIR )
                      </span>
                    </li>
                    <li className="list-pair mb-2">
                      <span className="list-key">Quyền mua tối thiểu</span>
                      <span className="ml-auto list-value font-semibold">
                        {project.launchpadInfo.individualMinimumAmount} USDT ({" "}
                        {project.launchpadInfo.individualMinimumAmount / 100} RIR )
                      </span>
                    </li>
                    <li className="list-pair mb-2">
                      <span className="list-key">Your RIR</span>
                      <span className="ml-auto list-value font-semibold">
                        {accountBalance?.rirBalance} RIR
                      </span>
                    </li>
                    <li className="list-pair mb-2">
                      <span className="list-key">Your BUSD</span>
                      <span className="ml-auto list-value font-semibold">
                        {accountBalance?.rirBalance} BUSD
                      </span>
                    </li>
                    {/* <li className="list-pair mb-2">
                      <span className="list-key">Đã mua</span>
                      <span className="ml-auto list-value font-semibold">
                        100 USDT (1 RIR)
                      </span>
                    </li>
                    <li className="list-pair mb-2">
                      <span className="list-key">Còn lại</span>
                      <span className="ml-auto font-semibold">
                        200 USDT (2 RIR)
                      </span>
                    </li> */}
                  </ul>

                  <div className="pt-4 mb-4 border-t border-gray-400 border-opacity-20">
                    <p>
                      <span className="icon mr-2 text-base">
                        <i className="fas fa-info-circle text-yellow-500"></i>
                      </span>
                      <span>Some notices about rights or terms here.</span>
                    </p>
                  </div>
                </div>

                <div className="box box--gray">
                  <div className="box-header">Swap Token</div>
                  <SwapTokens project={project} accountBalance={accountBalance} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-default project-main-actions no-padding overflow-hidden mt-4">
        <div className="card-header items-center">
          <h3>Subscriber (1000)</h3>
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

        {/* <div className="card-body no-padding">
          <div className="flex flex-col">
            <div className="global-padding-lg min-h-full">
              
              <Subscriber project={project} />  
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SubscribeSwapToken;

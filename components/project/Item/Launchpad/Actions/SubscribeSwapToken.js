import Subscriber from "./Subscriber";
import Timeline from "./Timeline";
import { useBUSDContract, useERC20, useRIRContract, useLaunchpadContractV2 } from "@utils/hooks/useContracts";
import { useEffect, useState } from "react";
import useActiveWeb3React from "@utils/hooks/useActiveWeb3React";
import { ethers, utils } from "ethers";
import { useTranslation } from "next-i18next";

import { useLaunchpadInfo } from "@utils/hooks/index";
import SwapTokensV2 from "./SwapTokenV2";
import Link from "next/link"
import { useCallWithGasPrice } from "@utils/hooks/useCallWithGasPrice"
import { toast } from "react-toastify"
import { set } from "store";
import SocialPromote from "../SocialPromote";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useChainConfig from "utils/web3/useChainConfig"
import MiniCountdown from "@components/project/List/Countdown";
import useStore from "@lib/useStore"


const SubscribeSwapToken = ({ project ,openTime,endTime,currentTime,pool}) => {
  const { t, i18n } = useTranslation("launchpad")
  const rirContract = useRIRContract()
  const bUSDContract = useBUSDContract()
  const { account } = useActiveWeb3React()
  const store = useStore()
  const { launchpadInfo, loading, fetchLaunchpadInfo } = useLaunchpadInfo({ pool,status : store.devStatus })
  const { callWithGasPrice } = useCallWithGasPrice()
  const { getRIRAddress, getBscScanURL } = useChainConfig()
  const launchpadContract = useLaunchpadContractV2(pool)
  const [accountBalance, setAccountBalance] = useState({})
  const [loadBalance, setLoadBalance] = useState(true)
  const [loadWhitelist, setLoadWhitelist] = useState(true)
  const [inWhitelist, setInWhitelist] = useState(!pool.is_whitelist)
  const [orderBusd, setOrderBusd] = useState(0)
  const [orderRIR, setOrderRIR] = useState(0)
  const [approvedBusd, setApprovedBusd] = useState(0)
  const [approveRIR, setApprovedRIR] = useState(0)
  const [step, setStep] = useState(2)
  const [claimDisbaled, setClaimDisbaled] = useState(false)
  const [tokenAddress,setTokenAddress] = useState(ethers.constants.AddressZero)


  const [poolStatus, setPoolStatus] = useState("");

  useEffect(() => {
    if (pool.open_date !== null && Date.parse(pool.open_date) < Date.parse(new Date()) && Date.parse(new Date()) < Date.parse(pool.end_date)) {
      setPoolStatus("open")
    }

    if (Date.parse(new Date()) < Date.parse(pool.open_date)) {
      setPoolStatus("coming")
    }
    if (Date.parse(new Date()) > Date.parse(pool.end_date)){
      setPoolStatus("closed")
    }
    if (pool.open_date == null) {
      setPoolStatus("tba")
    }
  }, [])

  const CountdownInPool = function(){
    return (
      <div className={`flex text-base justify-between items-center"`}>
        {poolStatus == "open" && <div className="text-base">{t("Pool closes in")}</div>}
        {poolStatus == "coming" && <div className="text-base">{t("Sale start in")}</div>}
        {poolStatus == "closed" && <div className="text-base">{t("pool closed")}</div>}
        {poolStatus == "tba" && <div className="text-base">{t("Comming Soon")}</div>}
        {poolStatus == "coming" && <MiniCountdown project={pool} isEndDate={false} />}
        {poolStatus == "open" && <MiniCountdown project={pool} isEndDate={true} />}
      </div>
    )
  }

  const fetchAccountBalance = async function () {
    await fetchLaunchpadInfo()
    let rirBalance = await rirContract.balanceOf(account);
    let busdBalance = await bUSDContract.balanceOf(account);
    setAccountBalance({
      rirBalance: utils.formatEther(rirBalance),
      busdBalance: utils.formatEther(busdBalance),
    })
  }
  useEffect(() => {
    if (!!account) {
      fetchAccountBalance().then(function () {
        setLoadBalance(false)
      });
    }
  }, [account])

  useEffect(() => {
    if (!!account && !!launchpadInfo) {
      setTokenAddress(launchpadInfo.tokenAddress)
    }
  }, [launchpadInfo,account])

  useEffect(() => {
    if (!!account && pool.is_whitelist && !!launchpadInfo) {
      if (launchpadInfo.investor.allocationBusd > 0){

        setInWhitelist(true)
        setLoadWhitelist(false)
      }
    }
    else{
      setLoadWhitelist(false)
    }
  }, [account,launchpadInfo])
  useEffect(() => {
    if (!loading){
      let currentOrderBusd = launchpadInfo.investor.amountBusd && launchpadInfo.investor.paid ? launchpadInfo.investor.amountBusd : 0
      let currentOrderRIR = launchpadInfo.investor.amountRir && launchpadInfo.investor.paid ? launchpadInfo.investor.amountRir : 0
      let currentApprovedBusd = launchpadInfo.investor.approved && launchpadInfo.investor.paid ? launchpadInfo.investor.allocationBusd : 0
      let currentApproveRIR = launchpadInfo.investor.approved && launchpadInfo.investor.paid ? launchpadInfo.investor.allocationRir : 0
      setOrderBusd(currentOrderBusd)
      setOrderRIR(currentOrderRIR)
      setApprovedBusd(currentApprovedBusd)
      setApprovedRIR(currentApproveRIR)
    }
  }, [launchpadInfo,loading])

  useEffect(() => {
    if (loading) return false
    //pool dont set winner
    if (launchpadInfo.stat.approvedBusd == 0 || !launchpadInfo.investor.paid){
      if (parseInt(orderBusd) > 0){
        // prefund success wait to approve whitelist
        setStep(31)
      }
      else{
        //pool has closeed, cant prefund
        if (currentTime > endTime){
          setStep (32)
        }
        else{
          //pool can prefund
          setStep(2)
        }
      }
    }
    //pool set winner
    else{
      //user win
      if (parseInt(approvedBusd) > 0){
        if (launchpadInfo.claimable + launchpadInfo.investor.claimedToken > 0 ){
          setStep(4)
        }
        else{
          setStep(33)
        }
      }
      //user not win
      else{
        //user sub
        if (parseInt(orderBusd) > 0){
          setStep(34)
        }
        //user not sub
        else{
          setStep(35)
        }
      }
    }

  }, [orderBusd, launchpadInfo,loading]);

  const handleClaimToken = async function (e) {
    try {
      setClaimDisbaled(true)
      const tx = await callWithGasPrice(launchpadContract, "claim", [pool.id])
      const receipt = await tx.wait()
      if (receipt.status) {
        toast.success(t("Claim success!"))
      }
      setClaimDisbaled(false)
      fetchAccountBalance()
    } catch (error) {
      setClaimDisbaled(false)
      console.log(error)
      if (!!error?.data?.message){
        toast.error(t(error?.data?.message?.replace("execution reverted: ","")))
      }
      else if (!!error?.message){
        toast.error(t(error?.message))
      }
      else{
        toast.error(t(error))
      }
    }
  }

  const handleCopy = () => {
    toast.success("Copied to clipboard", {})
  };

  if (loading || loadBalance || loadWhitelist) {
    return (
      <SubscribeSwapTokenLoading openTime={openTime} currentTime={currentTime} endTime={endTime} />
    )
  }
  if (!inWhitelist) {
    return (
      <NotInWhitesist></NotInWhitesist>
    )
  }
  const maxRIR = parseInt(launchpadInfo.individualMaximumAmount) / 100;
  const maxBusd = parseInt(launchpadInfo.individualMaximumAmount);
  return (
    <>
      {step == 2 &&
        <div className="card-default project-main-actions no-padding overflow-hidden">
          <div className="card-body no-padding">

            <div className="flex flex-col">
              <div className="">
                <Timeline step="2" />
              </div>

              <div className="project-card--container">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">

                  <div className="box box--transparent">

                    <div className="box-header !px-0">
                      <CountdownInPool />
                    </div>

                    <div className="box-header !px-0 sr-only">{t("Your allocation")}</div>

                    <ul className="mt-4 mb-2 flex-shrink-0 flex-grow">
                      {pool.is_allow_rir && parseInt(orderRIR) > 0 && <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">{t("Prefunded RIR")}</span>
                        <span className="ml-auto list-value font-semibold">
                          {orderRIR} RIR
                        </span>
                      </li>}
                      {parseInt(orderBusd) > 0 &&
                      <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">{t("Prefunded BUSD")}</span>
                        <span className="ml-auto list-value font-semibold">
                          {orderBusd} BUSD
                        </span>
                      </li>
                      }
                      <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">{t("Your maximum allocation")}</span>
                        <span className="ml-auto list-value font-semibold">
                          {launchpadInfo?.individualMaximumAmount} BUSD {accountBalance?.rirBalance > 0 && pool.is_allow_rir && <>({launchpadInfo?.individualMaximumAmount / 100} RIR)</>}
                        </span>
                      </li>
                      <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">{t("Your minimum allocation")}</span>
                        <span className="ml-auto list-value font-semibold">
                          {launchpadInfo?.individualMinimumAmount} BUSD {accountBalance?.rirBalance > 0 && pool.is_allow_rir && <>({launchpadInfo?.individualMinimumAmount / 100} RIR)</>}
                        </span>
                      </li>
                      {pool.is_allow_rir && parseFloat(accountBalance.rirBalance) > 0 && <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">{t("Your RIR Balance")}</span>
                        <span className="ml-auto list-value font-semibold">
                          {accountBalance.rirBalance} RIR
                        </span>
                      </li>}
                    </ul>

                    {pool.is_allow_rir && <div className="pt-4 mb-4 border-t border-gray-400 border-opacity-20">
                      <p className="relative mb-2">
                        <span className="icon mr-2 text-base opacity-60">
                          <i className="fas fa-check-circle"></i>
                        </span>
                        <span className="opacity-60">
                          {t("Prefund description")}
                        </span>
                      </p>
                      <p>
                        <span className="icon mr-2 text-base opacity-60">
                          <i className="fas fa-check-circle"></i>
                        </span>
                        <span className="opacity-60">
                          {t("Prefund description 2")}
                        </span>
                      </p>
                    </div>
                    }

                  </div>

                  <div className="box box--gray -mx-4 -mb-6 md:m-0">
                    <div className="box-header">{t("Prefund your investment")}</div>
                    <SwapTokensV2 accountBalance={accountBalance} fetchAccountBalance={fetchAccountBalance} setStep={setStep} pool={pool} project={project} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      {step == 32 &&
        <div className="card-default project-main-actions no-padding overflow-hidden">
          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="">
                <Timeline step="3" />
              </div>
              <div className="project-card--container">
                <div className="max-w-xl mx-auto">
                  <div className="mb-4 md:mb-8">
                    <h3 className="text-2xl text-center font-normal">
                      <span className="text-color-title">
                        {t("pool closed")}
                      </span>
                    </h3>
                  </div>
                  <SocialPromote />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      {(step == 31) &&
        <div className="card-default project-main-actions no-padding overflow-hidden">
          <div className="card-body no-padding">
            <div className="flex flex-col">

              <div className="">
                <Timeline step="3" />
              </div>

              <div className="project-card--container">
                <div className="max-w-xl mx-auto">
                  <div className="flex">
                    <div className="w-full">
                      <h3 className="text-xl md:text-2xl border-2 p-4 rounded-lg bg-green-500 bg-opacity-5 border-green-500 mb-4 text-green-500 text-center text-semibold">
                        <span className="icon mr-2">
                          <i className="fa-duotone fa-badge-check"></i>
                        </span>
                        {orderRIR > 0 ?
                          <span>
                          {t("prefunded note",
                            {
                              amount: orderBusd,
                              rir: orderRIR,
                            }
                          )
                          }</span>
                          :
                          <span>
                            {t("prefunded note usd",
                            {
                              amount: orderBusd,
                            }
                          )
                          }</span>
                        }
                      </h3>
                      <div className="mt-4">
                        <div className="inline-block w-full mx-auto  
                            rounded-md mb-4
                            border border-gray-200 dark:border-gray-600"
                        >
                          <div  className="pt-2 px-4">
                            <span className="mr-2 opacity-70">{t("Close at")}</span> 
                            <strong>7:27 AM, Sat Dec 25 2021 (GMT+7)</strong>
                          </div>
                          <div  className="py-2 px-4">
                            <span className="mr-2 opacity-70">{t("Announcement")}</span> 
                            <strong>7:27 AM, Sat Dec 28 2021 (GMT+7)</strong>
                          </div>
                        </div>
                      </div>
                      <TokenSocialPromote project={project} />

                      {currentTime < endTime && (parseInt(orderBusd) < maxBusd || ((parseInt(orderRIR) < maxRIR && parseInt(accountBalance.rirBalance) > 0) && pool.is_allow_rir)) &&
                      <div className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg flex cursor-pointer items-center group" onClick={e => { setStep(2) }} >
                        <span className="icon text-xl opacity-70 w-10 h-10 !flex items-center justify-center bg-white dark:bg-gray-900 rounded-full flex-shrink-0 mr-4 shadow transition-all">
                          <i className="fa fa-money-bill"></i>
                        </span>
                        <div>
                          <p className="mb-1 text-lg text-yellow-600 dark:text-yellow-400">{t("Adjust prefund")}</p>

                          <a href={`#`}  className="group">
                            <span className="text-sm mr-1">{t("adjust note",{"orderBusd" : orderBusd,"maxBusd" : maxBusd})}</span>
                            <span className="icon text-xs relative left-1 group-hover:left-2 transition-all"><i className="fas fa-angle-right"></i></span>
                          </a>
                        </div>
                      </div>
                      }
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      }

      {(step == 33) &&
        <div className="card-default project-main-actions no-padding overflow-hidden">

          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="">
                <Timeline step="3" />
              </div>

              <div className="project-card--container">
                <div className="max-w-xl mx-auto">

                  <div className="flex">
                    {/* <div className="s2e-illustration flex-shrink-0"></div> */}
                    <div className="w-full">
                      <div className="mb-4 p-4 rounded-lg bg-green-500 bg-opacity-5 border-green-500
                       text-green-500 border-2 border-green-400">
                        <h3 className="text-xl md:text-2xl mb-4  text-center text-semibold">
                          <span className="icon mr-2">
                            <i className="fa-duotone fa-badge-check"></i>
                          </span>
                          Congratulations! You've won the 
                        {/* {t("status success",{name : project.content.title})} */}
                        </h3>
                        <div className="text-center max-w-xs mx-auto">
                          <p className="flex">
                            <span className="ml-auto mr-4 w-16">{t("Prefunded BUSD")}</span>
                            <strong className="mr-auto">{orderBusd} BUSD</strong>
                          </p>
                          <p className="flex">
                            <span className="ml-auto mr-4 w-16">{t("Approved BUSD")}</span>
                            <strong className="mr-auto">{approvedBusd} BUSD</strong>
                          </p>
                          {launchpadInfo.refundable[0] > 0 &&
                          <p className="flex">
                            <span className="ml-auto mr-4 w-16">{t("Refund BUSD")}</span>
                            <strong className="mr-auto">{launchpadInfo.refundable[0]} BUSD</strong>
                          </p>
                          }
                          {launchpadInfo.refundable[1] > 0 &&
                          <p className="flex">
                            <span className="mr-auto mr-4 w-16">{t("Refund BUSD")}</span>
                            <strong className="ml-auto">{launchpadInfo.refundable[1]} RIR</strong>
                          </p>
                          }
                          {launchpadInfo.claimable[0] > 0 &&
                          <p> {t("refund note")}</p>
                          }
                        </div>
                      </div>

                     
                    </div>

                  </div>
                  <div className="flex items-center mt-2">
                    <TokenSocialPromote project={project} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      }

      {(step == 34) &&
        <div className="card-default project-main-actions no-padding overflow-hidden">

        <div className="card-body no-padding">
          <div className="flex flex-col">
            <div className="">
              <Timeline step="3" />
            </div>

            <div className="project-card--container">
              <div className="border rounded-lg border-gray-200 dark:border-gray-700 p-4 mx-auto mt-4 max-w-xl">       
                <h3 className="text-xl mb-4 text-yellow-600 dark:text-orange-500">{t("status failed")}</h3>
                {launchpadInfo.refundable[0] > 0 &&
                <>
                <p className="mb-4">{t("status failed note refund")}</p>
                <ul className="mt-auto">
                  <li className="list-pair mb-2">
                    <span className="!opacity-100">{t("Refund BUSD")}</span>
                    <div className="ml-auto text-right">                 
                    <strong>{launchpadInfo.refundable[0]} BUSD</strong>
                    </div>
                  </li>
                </ul>
                <div className="mt-4 list-value font-semibold">
                  <button onClick={e => { handleClaimToken(e) }} className={`w-full justify-center text-center btn btn-primary py-2 ` + (claimDisbaled ? " disabled" : "")}>Claim</button>
                </div>
                </>
                }
              </div>

            </div>
          </div>
        </div>
      </div>
      }

      {(step == 35) &&
        <div className="card-default project-main-actions no-padding overflow-hidden">

          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="">
                <Timeline step="3" />
              </div>

              <div className="project-card--container">
                <div className="max-w-2xl mx-auto text-center">

                  <div className="flex items-center">
                    <div className="mx-auto">
                      <h3 className="text-xl mb-4 text-yellow-600 dark:text-red-500">{t("Not allow")}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <SocialPromote ></SocialPromote>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      }
      {/* claim token */}
      {(step == 4) &&
        <div className="card-default project-main-actions no-padding overflow-hidden">

          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="">
                <Timeline step="4" />
              </div>
              <div className="project-card--container">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                  <div className="box box--transparent">
                    <div className="box-header !pl-0">
                      Investment
                    </div> 
                    <ul className="mt-4 mb-2 flex-shrink-0 flex-grow">
                    <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">Your investment</span>
                        <span className="ml-auto list-value font-semibold">
                          100 BUSD
                        </span>
                      </li>
                      <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">Total allocation</span>
                        <span className="ml-auto list-value font-semibold">
                          2000 PRL
                        </span>
                      </li>
                     
                      <li className="list-pair mb-2">
                        <span className="list-key !w-1/2 text-xs md:text-sm capitalize">Unvested</span>
                        <span className="ml-auto list-value font-semibold">
                          1000 PRL
                        </span>
                      </li>
                      <li className="list-pair mb-2">
                          <span className="list-key !w-1/2 text-xs md:text-sm capitalize">PRL Contract</span>
                          <div className="ml-auto p-2 rounded-lg flex bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700">
                            <a target="_blank" href={getBscScanURL(tokenAddress)}>
                              {`${tokenAddress.substr(0, 5)}...${tokenAddress.substr(-4)}`}
                            </a>
                            <CopyToClipboard
                              onCopy={handleCopy}
                              text={tokenAddress}
                            >
                              <button className="btn ml-2">
                                <i className="fa-duotone fa-copy text-2xs"></i>
                              </button>
                            </CopyToClipboard>
                          </div>
                        </li>
                    </ul>
                    
                  </div>

                  <div className="box box--gray -mx-4 -mb-6 md:m-0">
                    <div className="box-header flex">
                      <h4>Claim now</h4>
                      <div className="ml-auto text-right">500 PRL</div>
                    </div> 
                    <div className="p-6">
                      
                      {(launchpadInfo.claimable > 0 || launchpadInfo.refundable[0] > 0 || launchpadInfo.refundable[1] > 0) &&
                        <button onClick={e => { handleClaimToken(e) }} className={`w-full btn-primary py-2 px-4 rounded-md` + (claimDisbaled ? " disabled" : "")}>Claim</button>
                      }
                    
                      <div className="text-center">
                        <div className="progress-bar mt-6 bg-gray-300 dark:bg-gray-600 w-full h-4 rounded-full">
                          <div className="text-2xs font-semibold flex px-2 text-white items-center progress-bar--percentage h-4 bg-green-500 rounded-full w-1/5">20%</div>
                        </div>
                        <div className="text-sm mt-2 opacity-60">You've vested 20% of your total allocation</div>
                      </div>
                    </div>
                  </div>
                </div>
                
  
                <ul className="mt-4">
                 
                  {launchpadInfo.refundable[0] > 0 &&
                  <li className="list-pair mb-2">
                    <span className="w-3/5 !opacity-100">{t("busd claim note")}:</span>
                    <div className="w-2/5 ml-auto font-semibold">{launchpadInfo.refundable[0]} BUSD
                    </div>
                  </li>
                  }
                  {launchpadInfo.refundable[1] > 0 &&
                  <li className="list-pair mb-2">
                    <span className="w-3/5 !opacity-100">{t("RIR claim note")}:</span>
                    <div className="w-2/5 ml-auto font-semibold">{launchpadInfo.refundable[1]} RIR
                    </div>
                  </li>
                  }
                </ul>
                <div className="border rounded-lg border-gray-200 dark:border-gray-700 p-4 mx-auto mt-10 md:mt-8 max-w-xl">
                  <div className="box-header !pt-0 !pl-0">
                    <h4>Claim history</h4>
                  </div> 
                  <ul className="mb-0 mt-auto flex-shrink-0 flex-grow">
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-700"> 
                      <date>December 30, 2021</date>
                      <div className="ml-auto text-right font-semibold list-value">
                      500 PRL
                      </div>
                    </li>
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-700">             
                      <date>December 30, 2021</date>
                      <div className="ml-auto text-right font-semibold list-value">
                      500 PRL
                      </div>
                    </li>
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-700">
                      <date>December 30, 2021</date>
                      <div className="ml-auto text-right font-semibold list-value">
                      500 PRL
                      </div>
                    </li>
                    <li className="list-pair py-2 border-b border-gray-200 dark:border-gray-700">
                      <date>December 30, 2021</date>
                      <div className="ml-auto text-right font-semibold list-value">
                      500 PRL
                      </div>
                    </li>
                  
                  </ul>
                </div>
              </div>
              <div className="max-w-xl mx-auto mb-4 flex items-center">
                  <SocialPromote ></SocialPromote>
                </div>
            </div>
          </div>
        </div>
      }

      {/* {(orderBusd > 0 && launchpadInfo.winnerCount == 0) &&
        <div className="card-default project-main-actions no-padding overflow-hidden mt-4">
          <div className="card-header items-center">
            <h3>{t("Prefunders")} ({launchpadInfo?.ordersBuyerCount})</h3>
          </div>

          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="global-padding-lg min-h-full">

                <Subscriber project={project} buyers={launchpadInfo.buyers} />
              </div>
            </div>
          </div>
        </div>
      } */}

      {/* {(orderBusd > 0 && launchpadInfo.winnerCount > 0) &&
        <div className="card-default project-main-actions no-padding overflow-hidden mt-4">
          <div className="card-header items-center">
            <h3>{t("Winners")} ({launchpadInfo?.winnerCount})</h3>
          </div>

          <div className="card-body no-padding">
            <div className="flex flex-col">
              <div className="global-padding-lg min-h-full">

                <Subscriber project={project} buyers={launchpadInfo.winners} />
              </div>
            </div>
          </div>
        </div>
      } */}
    </>
  );
}

const SubscribeSwapTokenLoading = function({currentTime,opendTime,endTime}){
  return (
    <div className="card-default project-main-actions no-padding overflow-hidden">

      <div className="card-body no-padding">
        <div className="flex flex-col">
          <div className="">
            {currentTime > endTime ?
            <Timeline step="3" />
            :
            <Timeline step="2" />
            }

          </div>

          <div className="project-card--container">
            <div className="max-w-2xl mx-auto text-center">

              <div className="flex items-center">
                <div className="mx-auto">
                  <p className="relative mb-4 "><span className="spinner left-0 top-0"></span></p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

const TokenSocialPromote = function({project}){
  const {t,i18n} = useTranslation("launchpad")
  return (
    <ul className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <li  className="relative pl-6  mb-2">
        <span className="absolute left-0 top-0 mr-2">
          <i className="fa-duotone fa-circle-small opacity-60 mx-auto" />
        </span>
        <p className="" dangerouslySetInnerHTML={{__html : t("status note")}} >
        </p>
      </li>
      <li className="relative pl-6 mb-2">
        <span className="absolute left-0 top-0 mr-2">
          <i className="fa-duotone fa-circle-small opacity-60 mx-auto" />
        </span>
          <p className="" dangerouslySetInnerHTML={{__html : t("coming soon note",
          {
            twitter : `<a class="link" target="_blank" rel="nofollow" href="https://twitter.com/rada_network">@rada_network</a>`,
            radanetwork : `<a class="link" target="_blank" rel="nofollow" href="https://t.me/radanetwork">Telegram channel</a>`,
            radadao : `<a class="link" target="_blank" rel="nofollow" href="https://t.me/radadao">Telegram Community</a>`
          }
          )}} />
      </li>
      <li className="relative pl-6  mb-2">
        <span className="absolute left-0 top-0  mr-2">
          <i className="fa-duotone fa-circle-small opacity-60 mx-auto" />
        </span>
          <p className="" dangerouslySetInnerHTML={{__html : t("status note 2",
            {
              token : project.token.name,
              research : `<a class="link" target="_blank" rel="nofollow" href="/${i18n.language}/launchverse/${project.slug}/research">Research</a>`
            }
          )}} />
      </li>

    </ul>
  )
}

const NotInWhitesist = function(){
  const {t} = useTranslation("launchpad")
  return (
    <div className="card-default project-main-actions no-padding overflow-hidden">

      <div className="card-body no-padding">
        <div className="flex flex-col">
          <div className="">
            <Timeline step="1" />
          </div>

          <div className="project-card--container">
            <div className="max-w-2xl mx-auto text-center">

              <div className="flex items-center">
                <div className="mx-auto">
                  {t("Not allow")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscribeSwapToken
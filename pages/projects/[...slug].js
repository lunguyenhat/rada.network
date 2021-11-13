import { Layout } from "@components/page-layouts/Global";
import { observer } from "mobx-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { utils } from "ethers";

import { getProject } from "@data/query/projects";
import { usePageStore } from "@lib/usePageStore";
import ProjectItem from "@components/project/Item/Index";
import { WalletProfile } from "../../components/Wallet";
import useActiveWeb3React from "../../utils/hooks/useActiveWeb3React";
import useStore from "@lib/useStore";
import { useLaunchpadContract } from "../../utils/hooks/useContracts";

export default function ProjectPage({ slug, project, locale }) {
  const { dataStore } = usePageStore();
  dataStore.page = "project";
  dataStore.lang = locale;
  const page = slug.length > 1 ? slug[1] : "index";

  let meta = {
    title: project?.content?.title + "",
    description: project?.content?.description + "",
    "og:description": project?.content?.description + "",
    "og:image": project?.thumbnail_uri + "",
  };
  /* Dragger to resize main col */
  const containerRef = useRef();
  let wProject = { ...project };
  return (
    <Layout extraclassName="page-home" meta={meta}>
      <div className={`pane-content`} ref={containerRef}>
        <ProjectItem project={wProject} slug={slug} page={page} />
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(context) {
  let project = await getProject({ slug: context.params.slug[0], lang: context.locale });
  if (Object.keys(project).length === 0) {
    return {
      notFound: true,
    };
  }
  let props = {
    locale: context.locale,
    slug: context.params.slug,
    project: await getProject({ slug: context.params.slug[0], lang: context.locale }),
  };
  props = Object.assign(props, {
    ...(await serverSideTranslations(context.locale, ["common", "navbar", "invest"])),
  });
  return {
    props,
    revalidate: 60,
  };
}

import React from "react";
import { useRef, useState, useEffect } from "react";
import ContentLoader from "react-content-loader";

const TocSideBar = ({ mainScroll, content }) => {
  const [nestedHeadings, setNestedHeadings] = useState([]);
  const refToc = useRef();
  useEffect(() => {
    if (mainScroll.current != null && mainScroll.current != undefined) {
      mainScroll.current.addEventListener("wheel", handleScroll);
    }
    return () => {
      if (mainScroll.current != null && mainScroll.current != undefined) {
        mainScroll.current.removeEventListener("wheel", handleScroll);
      }
    };
  }, []);

  const handleScroll = () => {
    var toc = mainScroll.current.querySelectorAll("h2, h3");
    var visibleElements = [];
    toc.forEach((element) => {
      if (isVisible(element)) {
        visibleElements.push(element);
      }
    });

    if (visibleElements.length > 0) {
      if (visibleElements[0].tagName == "H2") {
        handleClickToc(null, "parent" + visibleElements[0].id);
      } else if (visibleElements[0].tagName == "H3") {
        // Deactive all h3
        const h3Elements = document.querySelectorAll("h3");
        for (var i = 0; i < h3Elements.length; i++) {
          document
            .getElementById("child" + h3Elements[i].id)
            .classList.remove("toc--active");
        }

        const elementChild = document.getElementById(
          "child" + visibleElements[0].id
        );

        const parentElement = elementChild.parentElement.parentElement.previousSibling;
        const curentParentActive = document.querySelector("a.toc--active.parent");
        if (curentParentActive && curentParentActive !== parentElement) {
          curentParentActive.classList.remove("toc--active")
        }

        if (!parentElement.classList.contains("toc--active")) {
          parentElement.classList.add("toc--active")
        }

        if (elementChild && !elementChild.classList.contains("toc--active")) {
          elementChild.classList.add("toc--active");
        }
      }
    }

    if (toc && toc.scrollHeight > toc.clientHeight) {
      var activeItem = toc.querySelector(".toc--active");
      if (activeItem) {
        toc.scrollTop = activeItem.offsetTop;
      }
    }
  };

  function isVisible(elem) {
    if (!(elem instanceof Element))
      throw Error("DomUtil: elem is not an element.");
    const style = getComputedStyle(elem);
    if (style.display === "none") return false;
    if (style.visibility !== "visible") return false;
    if (style.opacity < 0.1) return false;
    if (
      elem.offsetWidth +
      elem.offsetHeight +
      elem.getBoundingClientRect().height +
      elem.getBoundingClientRect().width ===
      0
    ) {
      return false;
    }
    const elemCenter = {
      x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
      y: elem.getBoundingClientRect().top + elem.offsetHeight / 2,
    };
    if (elemCenter.x < 0) return false;
    if (
      elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)
    )
      return false;
    if (elemCenter.y < 0) return false;
    if (
      elemCenter.y >
      (document.documentElement.clientHeight || window.innerHeight)
    )
      return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
      if (pointContainer === elem) return true;
    } while (pointContainer && (pointContainer = pointContainer.parentNode));
    return false;
  }

  useEffect(() => {

    const headingElements = Array.from(mainScroll.current.querySelectorAll("h2, h3"));
    const newNestedHeadings = getNestedHeadings(headingElements);
    setNestedHeadings(newNestedHeadings);

  }, [content]);

  const getNestedHeadings = (headingElements) => {
    const nestedHeadings = [];
    let h2Index = 1;
    let h3Index = 1;
    headingElements.forEach((heading, index) => {
      const { innerText: title } = heading;
      if (heading.nodeName === "H2") {
        let id = "h" + h2Index.toString();
        heading.setAttribute("id", id);
        nestedHeadings.push({ id, title, items: [] });
        h2Index += 1;
        h3Index = 1;
      } else if (heading.nodeName === "H3" && nestedHeadings.length > 0) {
        let id = "h" + h2Index.toString() + "-" + h3Index.toString();
        heading.setAttribute("id", id);
        nestedHeadings[nestedHeadings.length - 1].items.push({
          id,
          title,
        });
        h3Index += 1;
      }
    });
    return nestedHeadings;
  };

  const handleClickToc = (parentId, myId) => {
    try {
      let element = document.getElementById(myId);
      var currentActive = document.querySelectorAll(".toc--active");
      for (var i = 0; i < currentActive.length; i++) {
        currentActive[i].classList.remove("toc--active");
      }

      // set active for parent
      if (parentId) {
        const parent = document.getElementById(parentId);
        parent.classList += " toc--active";
      }

      element.classList += " toc--active";
    } catch (error) {

    }

  };

  return (
    <div ref={refToc} className="article-toc toc-sidebar" role="navigation">
      {nestedHeadings.length > 0 ? (
          <div className="toc-list">
          <h5 className="text-color-title">On this page</h5>

          <ol>
            {nestedHeadings.map(
              (heading, index) =>
                heading.title && (
                  <li key={heading.id}
                    className={heading.items.length > 0 ? "has-child" : ""}
                  >
                    <a
                      className={
                        index == 0 ? "toc--active parent menu" : "parent menu"
                      }
                      id={"parent" + heading.id}
                      href={`#${heading.title}`}
                      onClick={(e) => {
                        handleClickToc(null, "parent" + heading.id);
                        e.preventDefault();
                        document
                          .querySelector(`#${heading.id}`)
                          .scrollIntoView({
                            behavior: "smooth",
                          });
                      }}
                    >
                      {heading.title}
                    </a>
                    {heading.items.length > 0 && (
                      <ol>
                        {heading.items.map((child) => (
                          <li key={child.id}>
                            <a
                              id={"child" + child.id}
                              href={`#${child.title}`}
                              className="menu"
                              onClick={(e) => {
                                handleClickToc(
                                  "parent" + heading.id,
                                  "child" + child.id
                                );
                                e.preventDefault();
                                document
                                  .querySelector(`#${child.id}`)
                                  .scrollIntoView({
                                    behavior: "smooth",
                                  });
                              }}
                            >
                              {child.title}
                            </a>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                )
            )}
          </ol>
        </div>
      ) : null}

    </div>
  );
};

const TocLoader = () => (
  <ContentLoader
    viewBox="0 0 200 200"
    speed={2}
    backgroundColor="#9CA3AF"
    foregroundColor="#E5E7EB"
    style={{ opacity: "20%" }}
    preserveAspectRatio="xMidYMid meet"
  >
    <rect x="0" y="0" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="20" rx="4" ry="4" width="100" height="8" />
    <rect x="0" y="40" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="60" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="80" rx="4" ry="4" width="300" height="8" />
    <rect x="0" y="100" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="120" rx="4" ry="4" width="200" height="8" />
    <rect x="0" y="140" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="160" rx="4" ry="4" width="600" height="8" />
    <rect x="0" y="180" rx="4" ry="4" width="200" height="8" />
  </ContentLoader>
);

export default TocSideBar;

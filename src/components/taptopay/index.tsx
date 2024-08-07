import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function SmartphoneOutline({ drawProgress, opacityProgress }: { drawProgress: MotionValue<number>, opacityProgress: MotionValue<number> }) {
  return (
    <svg
      width="300"
      height="402"
      viewBox="0 0 202 402"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M181 1H21C9.9543 1 1 9.9543 1 21V381C1 392.046 9.9543 401 21 401H181C192.046 401 201 392.046 201 381V21C201 9.9543 192.046 1 181 1Z"
        fill="url(#paint0_linear_202_48)"
        stroke="black"
      />
      <path d="M71 21H131" stroke="black" />
      <path
        d="M96.5205 79.9375C88.2998 79.2178 81.0393 76.1648 76.3169 71.4362C73.6216 68.7429 71.9876 65.8192 71.252 62.3725C70.9151 60.8038 70.9151 58.2062 71.2576 56.6206C72.2852 51.8302 75.3736 47.6413 80.242 44.4421C91.3433 37.1552 108.352 37.1889 119.352 44.5264C120.812 45.4991 121.755 46.275 123.081 47.5795C124.748 49.2269 125.922 50.8687 127.157 53.2752C127.202 53.3651 127.432 53.4776 127.663 53.5226C128.443 53.6856 129.482 54.2929 130.319 55.0744C130.97 55.6816 131.47 56.3451 132.711 58.2231C133.963 60.1179 139.623 68.8666 139.966 69.4401C140.1 69.665 139.836 70.0193 139.539 70.0193C139.325 70.0193 139.179 69.8787 138.865 69.3839C138.646 69.0353 137.203 66.7919 135.659 64.3967C130.195 55.929 129.903 55.5355 128.381 54.7708L127.584 54.3716H125.237C122.89 54.3716 122.89 54.3716 122.834 54.619C122.525 55.974 122.463 56.3058 122.53 56.3676C122.575 56.407 123.906 57.166 125.49 58.0544L128.37 59.6681L128.19 60.0448C128.089 60.2528 127.977 60.4215 127.938 60.4215C127.898 60.4215 125.473 59.0777 122.547 57.4303C119.622 55.7885 117.055 54.3941 116.848 54.3378C116.017 54.1073 114.736 55.0294 114.736 55.8616C114.736 56.705 114.983 56.9467 120.127 61.1637C123.333 63.7951 125.169 65.375 125.45 65.7461C125.961 66.4264 126.478 67.4273 126.95 68.6586C127.786 70.8289 129.145 72.0378 131.374 72.6L132.11 72.7856L132.048 73.1848C132.014 73.4041 131.97 73.6065 131.941 73.6346C131.846 73.7414 130.369 73.2691 129.516 72.8587C128.179 72.2177 127.258 71.3012 126.354 69.7044C126.349 69.6932 125.821 69.8731 125.192 70.1036C124.069 70.5141 124.013 70.5478 122.951 71.588C118.42 76.0186 111.918 78.8468 104.073 79.8082C102.787 79.9881 97.8794 80.0612 96.5205 79.9375ZM104.331 78.5769C107.931 78.0989 110.727 77.3849 113.647 76.1873C116.713 74.9278 119.61 73.1229 121.632 71.2L122.429 70.441L120.419 69.4795C118.274 68.4506 118.061 68.2819 117.785 67.3654C117.611 66.7863 117.808 66.1678 118.358 65.5774L118.785 65.1107L117.853 64.4023C117.117 63.84 116.887 63.5983 116.741 63.2272C116.511 62.6256 116.595 61.9733 116.966 61.4504L117.246 61.0512L114.304 60.5339C112.687 60.2472 111.176 59.9604 110.952 59.893C110.508 59.7636 110.064 59.2576 109.947 58.7684C109.885 58.5042 111.328 51.4534 111.648 50.447C111.794 49.9972 112.406 49.4518 112.872 49.3675C113.361 49.2775 122.031 50.8012 122.463 51.0542C123.148 51.4534 123.361 52.0944 123.148 53.084L123.058 53.4945H123.535C123.799 53.4945 124.423 53.4607 124.922 53.4214L125.832 53.3483L125.383 52.5105C124.03 49.9859 121.564 47.4333 118.527 45.4092C117.106 44.4646 114.079 42.9689 112.254 42.3167C109.66 41.389 106.521 40.6918 103.506 40.3769C101.849 40.2026 97.5201 40.2082 95.9141 40.3825C92.0677 40.7986 88.575 41.6701 85.5203 42.9746C78.4451 45.9939 73.689 50.998 72.4705 56.6993C72.1504 58.1893 72.128 60.7982 72.42 62.1533C73.0657 65.1501 74.4695 67.7421 76.7549 70.1542C81.4156 75.0684 88.5357 78.0933 97.0708 78.7737C98.2163 78.8636 103.169 78.7287 104.331 78.5769ZM102.776 73.2129C102.338 73.0836 101.889 72.5607 101.793 72.0603C101.731 71.7342 101.804 71.5093 102.271 70.604C104.157 66.9493 104.977 63.587 104.977 59.5106C104.977 55.5692 104.253 52.4992 102.45 48.8221C102.063 48.0349 101.748 47.2983 101.748 47.1915C101.748 46.7979 102.074 46.2301 102.428 46.0108C102.911 45.7071 103.725 45.7634 104.118 46.1288C104.27 46.2694 104.657 46.9104 104.983 47.5514C106.274 50.0872 107.156 52.8703 107.594 55.766C107.863 57.5596 107.919 60.9556 107.7 62.5974C107.302 65.6224 106.504 68.3269 105.224 70.9695C104.449 72.5663 103.966 73.2242 103.562 73.2242C103.483 73.2242 103.349 73.2466 103.27 73.2691C103.191 73.2916 102.967 73.2691 102.776 73.2129ZM97.5257 70.4635C96.8518 70.2667 96.3633 69.4345 96.5599 68.816C96.6048 68.6642 96.9248 67.9726 97.2674 67.2754C98.7105 64.3236 99.3113 61.1637 99.0193 58.06C98.7779 55.5073 98.323 53.8993 97.1719 51.549C96.4026 49.9691 96.3633 49.7273 96.8125 49.0863C97.2393 48.4791 98.3062 48.3835 98.8621 48.8952C99.2495 49.2494 100.457 51.7739 100.923 53.2021C102.461 57.9251 102.226 63.0023 100.255 67.6409C99.2383 70.0193 98.5252 70.7558 97.5257 70.4635ZM92.1126 67.6746C91.6971 67.4891 91.3377 67.0449 91.2366 66.6007C91.1748 66.3308 91.2815 66.0272 91.7757 65.0264C93.595 61.338 93.6119 57.7901 91.8374 54.186C91.0569 52.6061 91.0401 52.2912 91.6971 51.6671C92.0227 51.3579 92.1631 51.3073 92.618 51.3073C93.3872 51.3073 93.7859 51.6952 94.471 53.1065C95.5266 55.2768 95.959 57.1604 95.9534 59.5725C95.9478 62.052 95.5435 63.7557 94.4204 66.0441C93.7747 67.3542 93.4546 67.7028 92.8089 67.7871C92.6123 67.804 92.2979 67.759 92.1126 67.6746ZM87.0589 65.077C86.7276 64.9421 86.3514 64.4923 86.239 64.0987C86.1155 63.6601 86.2166 63.3115 86.7107 62.4962C87.3509 61.4448 87.4969 60.8825 87.4969 59.5106C87.4969 58.1387 87.3509 57.5708 86.7107 56.525C86.4917 56.1708 86.2784 55.7435 86.2278 55.5748C86.0201 54.8832 86.5984 54.0342 87.3733 53.888C88.0303 53.7643 88.4795 54.0567 89.086 55.0013C90.8323 57.7339 90.8323 61.3773 89.086 64.0874C88.4683 65.0376 87.7832 65.375 87.0589 65.077ZM124.698 69.3164C125.282 69.1084 125.787 68.9116 125.821 68.8779C125.855 68.8441 125.742 68.4731 125.568 68.0457C125.22 67.1742 125.276 67.1967 124.03 67.4329C122.688 67.6915 121.907 67.461 120.436 66.3758C120.037 66.0778 119.622 65.8361 119.521 65.8361C119.414 65.8361 119.189 65.9879 119.01 66.179C118.633 66.5839 118.577 67.2136 118.88 67.5903C119.15 67.9164 122.839 69.6763 123.277 69.6875C123.474 69.6932 124.108 69.5245 124.698 69.3164ZM124.114 66.4883C124.658 66.3758 124.72 66.3421 124.625 66.1622C124.518 65.9654 119.414 61.7259 118.97 61.4617C118.605 61.248 118.308 61.2986 118.004 61.6247C117.117 62.575 117.224 62.7774 119.521 64.5372C122.294 66.6682 122.592 66.7919 124.114 66.4883ZM117.263 60.0616C117.263 60.0335 116.685 59.5331 115.977 58.954C114.231 57.5146 113.855 56.9748 113.855 55.9065C113.855 55.0182 114.45 54.1579 115.405 53.6631C115.876 53.4157 116.724 53.3426 117.201 53.5001C117.538 53.6125 119.066 54.439 121.177 55.6535L121.621 55.9122L121.986 54.1692C122.362 52.3868 122.367 51.9145 122.019 51.8077C121.913 51.7739 119.874 51.4028 117.493 50.9811C113.26 50.2333 112.793 50.1884 112.597 50.5088C112.49 50.6775 110.879 58.1556 110.879 58.4705C110.879 58.6279 110.957 58.8247 111.058 58.909C111.154 58.9934 112.53 59.2914 114.113 59.5725C117.168 60.1235 117.263 60.1404 117.263 60.0616Z"
        fill="white"
      />
      {/* Success indicator */}
      <g>
        <motion.circle
          cx="100"
          cy="194"
          r="20"
          className="indicator"
          stroke="#66BB6A"
          strokeWidth="2"
          style={{ pathLength: drawProgress }}
        />
        <motion.path
          d="M91.6383 195.021L97.8936 201.277L110.404 188.766"
          stroke="#66BB6A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: drawProgress, opacity: opacityProgress }}
        />
        <motion.path
          d="M83.0455 236H79.2784V224.364H83.1648C84.3049 224.364 85.2841 224.597 86.1023 225.062C86.9205 225.525 87.5473 226.189 87.983 227.057C88.4223 227.92 88.642 228.956 88.642 230.165C88.642 231.377 88.4205 232.419 87.9773 233.29C87.5379 234.161 86.9015 234.831 86.0682 235.301C85.2348 235.767 84.2273 236 83.0455 236ZM81.0341 234.466H82.9489C83.8352 234.466 84.572 234.299 85.1591 233.966C85.7462 233.629 86.1856 233.142 86.4773 232.506C86.7689 231.866 86.9148 231.085 86.9148 230.165C86.9148 229.252 86.7689 228.477 86.4773 227.841C86.1894 227.205 85.7595 226.722 85.1875 226.392C84.6155 226.062 83.9053 225.898 83.0568 225.898H81.0341V234.466ZM94.3651 236.176C93.5469 236.176 92.8329 235.989 92.223 235.614C91.6132 235.239 91.1397 234.714 90.8026 234.04C90.4654 233.366 90.2969 232.578 90.2969 231.676C90.2969 230.771 90.4654 229.979 90.8026 229.301C91.1397 228.623 91.6132 228.097 92.223 227.722C92.8329 227.347 93.5469 227.159 94.3651 227.159C95.1832 227.159 95.8973 227.347 96.5071 227.722C97.117 228.097 97.5904 228.623 97.9276 229.301C98.2647 229.979 98.4332 230.771 98.4332 231.676C98.4332 232.578 98.2647 233.366 97.9276 234.04C97.5904 234.714 97.117 235.239 96.5071 235.614C95.8973 235.989 95.1832 236.176 94.3651 236.176ZM94.3707 234.75C94.901 234.75 95.3404 234.61 95.6889 234.33C96.0374 234.049 96.295 233.676 96.4616 233.21C96.6321 232.744 96.7173 232.231 96.7173 231.67C96.7173 231.114 96.6321 230.602 96.4616 230.136C96.295 229.667 96.0374 229.29 95.6889 229.006C95.3404 228.722 94.901 228.58 94.3707 228.58C93.8366 228.58 93.3935 228.722 93.0412 229.006C92.6927 229.29 92.4332 229.667 92.2628 230.136C92.0961 230.602 92.0128 231.114 92.0128 231.67C92.0128 232.231 92.0961 232.744 92.2628 233.21C92.4332 233.676 92.6927 234.049 93.0412 234.33C93.3935 234.61 93.8366 234.75 94.3707 234.75ZM102.028 230.818V236H100.33V227.273H101.96V228.693H102.068C102.269 228.231 102.583 227.86 103.011 227.58C103.443 227.299 103.987 227.159 104.642 227.159C105.237 227.159 105.758 227.284 106.205 227.534C106.652 227.78 106.998 228.148 107.244 228.636C107.491 229.125 107.614 229.729 107.614 230.449V236H105.915V230.653C105.915 230.021 105.75 229.527 105.42 229.17C105.091 228.811 104.638 228.631 104.062 228.631C103.669 228.631 103.318 228.716 103.011 228.886C102.708 229.057 102.468 229.307 102.29 229.636C102.116 229.962 102.028 230.356 102.028 230.818ZM113.653 236.176C112.794 236.176 112.053 235.992 111.432 235.625C110.814 235.254 110.337 234.733 110 234.062C109.667 233.388 109.5 232.598 109.5 231.693C109.5 230.799 109.667 230.011 110 229.33C110.337 228.648 110.807 228.116 111.409 227.733C112.015 227.35 112.723 227.159 113.534 227.159C114.027 227.159 114.504 227.241 114.966 227.403C115.428 227.566 115.843 227.822 116.21 228.17C116.578 228.519 116.867 228.972 117.08 229.528C117.292 230.081 117.398 230.754 117.398 231.545V232.148H110.46V230.875H115.733C115.733 230.428 115.642 230.032 115.46 229.688C115.278 229.339 115.023 229.064 114.693 228.864C114.367 228.663 113.985 228.562 113.545 228.562C113.068 228.562 112.652 228.68 112.295 228.915C111.943 229.146 111.67 229.449 111.477 229.824C111.288 230.195 111.193 230.598 111.193 231.034V232.028C111.193 232.612 111.295 233.108 111.5 233.517C111.708 233.926 111.998 234.239 112.369 234.455C112.741 234.667 113.174 234.773 113.67 234.773C113.992 234.773 114.286 234.727 114.551 234.636C114.816 234.542 115.045 234.402 115.239 234.216C115.432 234.03 115.58 233.801 115.682 233.528L117.29 233.818C117.161 234.292 116.93 234.706 116.597 235.062C116.267 235.415 115.852 235.689 115.352 235.886C114.856 236.08 114.29 236.176 113.653 236.176ZM121.425 224.364L121.277 232.653H119.703L119.555 224.364H121.425ZM120.493 236.108C120.179 236.108 119.91 235.998 119.686 235.778C119.463 235.555 119.353 235.286 119.357 234.972C119.353 234.661 119.463 234.396 119.686 234.176C119.91 233.953 120.179 233.841 120.493 233.841C120.8 233.841 121.065 233.953 121.288 234.176C121.512 234.396 121.625 234.661 121.629 234.972C121.625 235.18 121.571 235.371 121.464 235.545C121.362 235.716 121.226 235.852 121.055 235.955C120.885 236.057 120.697 236.108 120.493 236.108Z"
          fill="#66BB6A"
          style={{ opacity: opacityProgress }}
        />
      </g>

      <defs>
        <linearGradient
          id="paint0_linear_202_48"
          x1="101"
          y1="1"
          x2="101"
          y2="401"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#424242" />
          <stop offset="1" stopColor="#757575" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CreditCardOutline() {
  return (
    <svg
      width="300"
      height="120"
      viewBox="0 0 299 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="298"
        height="191"
        rx="15.5"
        fill="#1E88E5"
        stroke="black"
      />
      <mask
        id="mask0_202_39"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="29"
        y="124"
        width="57"
        height="39"
      >
        <rect
          x="29.5"
          y="124.5"
          width="56"
          height="38"
          rx="6.5"
          fill="#D9D9D9"
          stroke="black"
        />
      </mask>
      <g mask="url(#mask0_202_39)">
        <rect
          x="26.5"
          y="143.5"
          width="23"
          height="10"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="64.5"
          y="143.5"
          width="23"
          height="10"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="26.5"
          y="133.5"
          width="23"
          height="10"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="64.5"
          y="133.5"
          width="23"
          height="10"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="26.5"
          y="121.5"
          width="31"
          height="12"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="57.5"
          y="121.5"
          width="31"
          height="12"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="26.5"
          y="153.5"
          width="31"
          height="12"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
        <rect
          x="57.5"
          y="153.5"
          width="31"
          height="12"
          rx="2.5"
          fill="#FFCA28"
          stroke="black"
        />
      </g>
      <rect x="29.5" y="124.5" width="56" height="38" rx="6.5" stroke="black" />
      <path
        d="M204.442 148.05C204.304 147.619 204.12 147.233 203.888 146.892C203.661 146.546 203.388 146.253 203.071 146.011C202.754 145.765 202.392 145.578 201.984 145.45C201.582 145.322 201.139 145.259 200.656 145.259C199.837 145.259 199.098 145.469 198.44 145.891C197.782 146.312 197.261 146.93 196.878 147.744C196.499 148.554 196.31 149.546 196.31 150.72C196.31 151.899 196.501 152.896 196.885 153.71C197.268 154.525 197.794 155.143 198.462 155.564C199.129 155.985 199.889 156.196 200.741 156.196C201.532 156.196 202.221 156.035 202.808 155.713C203.4 155.391 203.857 154.937 204.179 154.349C204.506 153.758 204.669 153.062 204.669 152.261L205.237 152.368H201.075V150.557H206.793V152.212C206.793 153.433 206.532 154.494 206.011 155.393C205.495 156.288 204.78 156.98 203.866 157.467C202.957 157.955 201.916 158.199 200.741 158.199C199.425 158.199 198.27 157.896 197.276 157.29C196.286 156.684 195.514 155.824 194.96 154.712C194.406 153.594 194.129 152.268 194.129 150.734C194.129 149.574 194.29 148.533 194.612 147.609C194.934 146.686 195.386 145.902 195.969 145.259C196.556 144.61 197.245 144.115 198.036 143.774C198.831 143.429 199.7 143.256 200.642 143.256C201.428 143.256 202.16 143.372 202.837 143.604C203.518 143.836 204.125 144.165 204.655 144.591C205.19 145.017 205.633 145.524 205.983 146.111C206.333 146.693 206.57 147.339 206.693 148.05H204.442ZM209.408 158V147.091H211.461V148.824H211.574C211.773 148.237 212.123 147.775 212.625 147.439C213.132 147.098 213.705 146.928 214.344 146.928C214.477 146.928 214.633 146.932 214.813 146.942C214.998 146.951 215.142 146.963 215.246 146.977V149.009C215.161 148.985 215.009 148.959 214.792 148.93C214.574 148.897 214.356 148.881 214.138 148.881C213.636 148.881 213.189 148.987 212.796 149.2C212.408 149.409 212.1 149.7 211.873 150.074C211.645 150.443 211.532 150.865 211.532 151.338V158H209.408ZM220.161 158.241C219.47 158.241 218.845 158.114 218.286 157.858C217.727 157.598 217.284 157.221 216.958 156.729C216.636 156.236 216.475 155.633 216.475 154.918C216.475 154.302 216.593 153.795 216.83 153.398C217.067 153 217.386 152.685 217.789 152.453C218.191 152.221 218.641 152.046 219.138 151.928C219.635 151.809 220.142 151.719 220.658 151.658C221.311 151.582 221.842 151.52 222.249 151.473C222.656 151.421 222.952 151.338 223.137 151.224C223.321 151.111 223.414 150.926 223.414 150.67V150.621C223.414 150 223.239 149.52 222.888 149.179C222.542 148.838 222.026 148.668 221.34 148.668C220.625 148.668 220.061 148.826 219.65 149.143C219.242 149.456 218.961 149.804 218.804 150.188L216.809 149.733C217.045 149.07 217.391 148.535 217.846 148.128C218.305 147.716 218.833 147.418 219.429 147.233C220.026 147.044 220.653 146.949 221.311 146.949C221.747 146.949 222.209 147.001 222.696 147.105C223.189 147.205 223.648 147.389 224.074 147.659C224.505 147.929 224.858 148.315 225.132 148.817C225.407 149.314 225.544 149.96 225.544 150.756V158H223.471V156.509H223.385C223.248 156.783 223.042 157.053 222.767 157.318C222.493 157.583 222.14 157.804 221.709 157.979C221.278 158.154 220.762 158.241 220.161 158.241ZM220.623 156.537C221.21 156.537 221.712 156.421 222.128 156.189C222.55 155.957 222.869 155.654 223.087 155.28C223.31 154.901 223.421 154.496 223.421 154.065V152.659C223.345 152.735 223.198 152.806 222.98 152.872C222.767 152.934 222.524 152.988 222.249 153.036C221.974 153.078 221.707 153.118 221.446 153.156C221.186 153.189 220.968 153.218 220.793 153.241C220.381 153.294 220.005 153.381 219.664 153.504C219.328 153.627 219.058 153.805 218.854 154.037C218.655 154.264 218.556 154.567 218.556 154.946C218.556 155.472 218.75 155.869 219.138 156.139C219.526 156.404 220.021 156.537 220.623 156.537ZM228.373 158V147.091H230.411V148.866H230.546C230.773 148.265 231.145 147.796 231.661 147.46C232.177 147.119 232.795 146.949 233.515 146.949C234.244 146.949 234.855 147.119 235.347 147.46C235.844 147.801 236.211 148.27 236.448 148.866H236.562C236.822 148.284 237.237 147.82 237.805 147.474C238.373 147.124 239.05 146.949 239.836 146.949C240.826 146.949 241.633 147.259 242.258 147.879C242.888 148.5 243.202 149.435 243.202 150.685V158H241.079V150.884C241.079 150.145 240.878 149.61 240.475 149.278C240.073 148.947 239.592 148.781 239.033 148.781C238.342 148.781 237.805 148.994 237.421 149.42C237.038 149.842 236.846 150.384 236.846 151.047V158H234.729V150.749C234.729 150.157 234.545 149.681 234.175 149.321C233.806 148.961 233.326 148.781 232.734 148.781C232.331 148.781 231.96 148.888 231.619 149.101C231.282 149.309 231.01 149.6 230.802 149.974C230.598 150.348 230.496 150.782 230.496 151.274V158H228.373ZM251.512 158V143.455H253.707V156.111H260.298V158H251.512ZM262.631 158V147.091H264.754V158H262.631ZM263.703 145.408C263.334 145.408 263.017 145.285 262.751 145.038C262.491 144.787 262.361 144.489 262.361 144.143C262.361 143.793 262.491 143.495 262.751 143.249C263.017 142.998 263.334 142.872 263.703 142.872C264.072 142.872 264.387 142.998 264.648 143.249C264.913 143.495 265.045 143.793 265.045 144.143C265.045 144.489 264.913 144.787 264.648 145.038C264.387 145.285 264.072 145.408 263.703 145.408ZM274.522 153.476V147.091H276.652V158H274.564V156.111H274.451C274.2 156.693 273.797 157.179 273.243 157.567C272.694 157.95 272.01 158.142 271.191 158.142C270.49 158.142 269.87 157.988 269.33 157.68C268.795 157.368 268.373 156.906 268.066 156.295C267.763 155.685 267.611 154.929 267.611 154.03V147.091H269.735V153.774C269.735 154.518 269.941 155.109 270.353 155.55C270.765 155.99 271.3 156.21 271.958 156.21C272.355 156.21 272.751 156.111 273.144 155.912C273.542 155.713 273.871 155.412 274.131 155.01C274.396 154.607 274.526 154.096 274.522 153.476Z"
        fill="white"
      />
    </svg>
  );
}

export default function TapToPayAnimation() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: smartphoneProgressRaw } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  const creditCardY = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    [-100, 80, 80]
  );

  const smartphoneProgress = useTransform(
    smartphoneProgressRaw,
    [0, 0.3, 0.5, 1],
    [0, 0, 1, 1]
  );
  const smartphoneOpacity = useTransform(
    smartphoneProgressRaw,
    [0, 0.2, 0.3, 1],
    [0, 0, 1, 1]
  );

  return (
    <div ref={ref}>
      <motion.div className="transform">
        <motion.div style={{ y: creditCardY }}>
          <CreditCardOutline />
        </motion.div>
        <SmartphoneOutline drawProgress={smartphoneProgress} opacityProgress={smartphoneOpacity} />
      </motion.div>
    </div>
  );
}

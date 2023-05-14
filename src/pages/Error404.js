import "./Error404.css";
export default function Error404() {
  return (
    <div class="Error404">
      <h1 class="first-four">4</h1>
      <div class="cog-wheel1">
        <div class="cog1">
          <div class="top"></div>
          <div class="down"></div>
          <div class="left-top"></div>
          <div class="left-down"></div>
          <div class="right-top"></div>
          <div class="right-down"></div>
          <div class="left"></div>
          <div class="right"></div>
        </div>
      </div>
      <div class="cog-wheel2">
        <div class="cog2">
          <div class="top"></div>
          <div class="down"></div>
          <div class="left-top"></div>
          <div class="left-down"></div>
          <div class="right-top"></div>
          <div class="right-down"></div>
          <div class="left"></div>
          <div class="right"></div>
        </div>
      </div>
      <h1 class="second-four" style={{ color: "white" }}>
        4
      </h1>
      <div class="wrong-para">
        <p>Uh Oh! Page not found!</p>
        <span> let us take you </span>
        <a href="/">BACK</a>
      </div>
    </div>
  );
}

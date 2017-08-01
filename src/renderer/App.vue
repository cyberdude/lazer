<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'lazer-ui'
  }
</script>

<style lang="scss">
  /* CSS */
$mediumOverwrite: 760px;

$breakpoints: (
  small: 0,
  medium: $mediumOverwrite,
  large: 1024px,
  xlarge: 1200px,
  xxlarge: 1440px,
);

@import '~foundation-sites/scss/foundation';
@include foundation-everything(false);
// @import 'scss/variables';


button {
  border: 1px solid;
  padding: .3em;
}

button:hover {
  cursor: pointer;
}
</style>

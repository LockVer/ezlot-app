<template>
    <div class="input-container">
      <input :type="type" v-model="inputValue" @focus="toggleLabel(true)" @blur="toggleLabel(false)">
      <span :class="{ 'label-active': isActive }">{{ label }}</span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: String,
      label: String,
      type: String
    },
    data() {
      return {
        inputValue: this.value,
        isActive: false
      };
    },
    watch: {
      inputValue(newValue) {
        this.$emit('input', newValue);
      }
    },
    methods: {
      toggleLabel(isFocused) {
        this.isActive = isFocused || this.inputValue.length > 0;
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .input-container {
    position: relative;
    margin-top: 20px;
    background: #E5E5E5;
    border-radius: 2px;
    input {
      width: 100%;
      height: 58px;
      padding: 10px;
      padding-top: 25px;
      outline:none;
      border:none;
      font-size:20px;
      background:#E5E5E5;
      border-radius: 2px;
    }
    span {
      position: absolute;
      left: 20px;
      top:50%;
      transform: translateY(-50%);
      color: #999;
      transition: all 0.3s ease;
      pointer-events: none;
    }
    .label-active {
      transform: translateX(-20px) translateY(-25px) scale(0.7);
      color: #333;
    }
  }
  </style>
  
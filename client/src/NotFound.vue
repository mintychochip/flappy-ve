<template>
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-title">Page Not Found</h1>
        <router-link to="/" class="home-link">Go Back to Home</router-link>
      </div>
    </div>
</template>
  
  <script>
  export default {
    name: "NotFoundPage",
  };
  </script>
  
  <style scoped>
  .not-found-container {
    background-color: #f8f9fa;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  .not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .not-found-title {
    font-size: 48px;
    font-weight: bold;
    color: #343a40;
  }
  
  .home-link {
    font-size: 18px;
    color: #007bff;
    text-decoration: none;
    padding: 10px 20px;
    border: 2px solid #007bff;
    border-radius: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .home-link:hover {
    background-color: #007bff;
    color: #fff;
  }
  </style>
  
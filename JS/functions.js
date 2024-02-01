import {id, secret} from "../JS/app_creds.js";
var API_TOKEN = "https://accounts.spotify.com/api/token"
var redirect_uri = 'http://localhost/projets/Receiptica/src/redirect.html';

if (window.location.href.includes(redirect_uri)) {
  onPageLoad()
  document.getElementById("searchBar").addEventListener('input', function() {
    search_artist();
});

  document.getElementById("btnTop1").addEventListener("click", function() {
    document.getElementById('tableArtist').getElementsByTagName('tbody')[0].innerHTML = "";
    followedArtist(localStorage.getItem("access_token"));
  });

  document.getElementById("btnTop2").addEventListener('click', function() {
    document.getElementById('tableArtist').getElementsByTagName('tbody')[0].innerHTML = "";
    topTrack(localStorage.getItem("access_token"));
});

  document.getElementById("btnTop3").addEventListener('click', function() {
    document.getElementById('tableArtist').getElementsByTagName('tbody')[0].innerHTML = "";
    topArtist(localStorage.getItem("access_token"));
});
}

const generateRandomString = (length) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

document.getElementById('spotifyButton').addEventListener("click", function() {
    authorize2();
});
  
function authorize2() {
    var scope = "user-read-private user-read-email user-top-read user-follow-read"
    var state = generateRandomString(16);
    let redirect = "https://accounts.spotify.com/authorize?response_type=code" + "&client_id=" + id + "&scope=" + scope + "&redirect_uri=" + encodeURI(redirect_uri) + "&state=" + state + "&show_dialog=true";
    let xhr = new XMLHttpRequest();
    xhr.open("GET", redirect);
    xhr.setRequestHeader("Access-Control-Allow-Headers", "http://localhost/projets/Receiptica/");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "http://localhost/projets/Receiptica/");
    xhr.onreadystatechange = () => {
      // Call a function when the state changes.
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        window.location.href = redirect;
      }
    };
    xhr.send();
}

function onPageLoad() {
    if (window.location.search.length > 0) {
      handleRedirect();
    }
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
      alert("The page has been refreshed ! Redirecting to Home page !")
      window.location.href = "http://localhost/projets/Receiptica/index.html";
    }
}

function handleRedirect() {
    let code = getCode();
    getAccessToken(code)
  }
  
  function getCode() {
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function getAccessToken(code) {
    let access_token = null;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", API_TOKEN);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(id + ":" + secret))
    xhr.onreadystatechange = () => {
        // Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          var json = JSON.parse(xhr.response)
          access_token = json.access_token;
          localStorage.setItem("access_token", access_token);
          profile(access_token)
          followedArtist(access_token)

          return access_token;
        }
        
      };
    xhr.send("grant_type=authorization_code&code=" + code + "&redirect_uri=" + encodeURI(redirect_uri) + "&client_id=" + id + "&client_secret=" + secret);
};

// Et ensuite avec le access_token, on accède aux différentes ressources !
function followedArtist(access_token) {
    var artistCount = 0;
    var url = "https://api.spotify.com/v1/me/following?type=artist"

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token)

    xhr.onreadystatechange = () => {
      // Call a function when the state changes.
      let cell1 = "";
      let cell2 = "";
      let cell3 = "";
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log(xhr.response)
        var json = JSON.parse(xhr.response);

        var tbodyRef = document.getElementById('tableArtist').getElementsByTagName('tbody')[0];
        let thirdTh = document.getElementsByTagName("th")[2];
        
        if (json.artists.items.length != 0) {
          for (var i = 0; i < json.artists.items.length; i++) {
            let row = tbodyRef.insertRow();
            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);
            cell3 = row.insertCell(2);
  
            var followed_artist = json.artists.items[i].name;
            var image_artist = "";
  
            if (json.artists.items[i].images == "") {
              cell2.innerHTML = "The artist " + json.artists.items[i].name + " has no profile picture.";
            } else {
              image_artist = json.artists.items[i].images[0].url;
              cell2.innerHTML = "<img src=\"" + image_artist + "\" width=300px height=300px>"  + "<p id=\"fArtist\">" + followed_artist + "</p>";
            }
            artistCount++;
            thirdTh.innerHTML = "<b>Genre</b>";
            //console.log(json.artists.items[1].images[0].url);
            cell1.innerHTML = "<b>" + artistCount + "</b>";
            cell3.innerHTML = json.artists.items[i].genres[0]; 
          }
        } else {
          alert("User does not follow any artists.")
        }
      }
    };
  xhr.send();
}

function topArtist(access_token) {
  var url = "https://api.spotify.com/v1/me/top/artists?time_range=long_term&offset=0&limit=10"
  var topArtistCount = 0;
  let cell1 = "";
  let cell2 = "";
  let cell3 = "";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token)

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var json = JSON.parse(xhr.response)
      var tbodyRef = document.getElementById('tableArtist').getElementsByTagName('tbody')[0];
      let thirdTh = document.getElementsByTagName("th")[2];
      if (json.items.length != 0 ) {
        for (var i = 0; i < json.items.length; i++) {
          var topArtistImage = json.items[i].images[1].url;
          let row = tbodyRef.insertRow();
          cell1 = row.insertCell(0);
          cell2 = row.insertCell(1);
          cell3 = row.insertCell(2);

          topArtistCount++;
          thirdTh.innerHTML = "<b>Genre</b>";
          cell1.innerHTML = topArtistCount;
          cell2.innerHTML = "<img src=\"" + topArtistImage + "\" width=300px height=300px/>"  + "<p id=\"fArtist\">" + json.items[i].name + "</p>";
          cell3.innerHTML = json.items[i].genres[0];

        }
      } else {
        alert("User does not have any top artists.")
      }
    }
  };
  xhr.send();
}

function topTrack(access_token) {
  var url = "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&offset=0&limit=10"
  var topTrackCount = 0;
  let cell1 = "";
  let cell2 = "";
  let cell3 = "";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token)

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var json = JSON.parse(xhr.response)
      var tbodyRef = document.getElementById('tableArtist').getElementsByTagName('tbody')[0];
      let thirdTh = document.getElementsByTagName("th")[2];
      if (json.items.length != 0 ) {
        for (var i = 0; i < json.items.length; i++) {
          var topTrackImage = json.items[i].album.images[1].url;
          let row = tbodyRef.insertRow();
          cell1 = row.insertCell(0);
          cell2 = row.insertCell(1);
          cell3 = row.insertCell(2);

          thirdTh.innerHTML = "<b>Track Type</b>";
          topTrackCount++;
          cell1.innerHTML = topTrackCount;
          cell2.innerHTML = "<img src=\"" + topTrackImage + "\" id=\"topTrackImage\"/>" + "<p> <iframe style=\"border-radius:12px\" src=\"https://open.spotify.com/embed/track/" + json.items[i].id + "?utm_source=generator\" width=\"22.5%\" height=\"152\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe></p> <p id=\"fArtist\">" +  json.items[i].artists[0].name + "</p> <p>" + json.items[i].name + "</p>";
          cell3.innerHTML = json.items[i].album.album_type;

        }
      } else {
        alert("User does not have any top tracks.")
      }
    }
  };
  xhr.send();
}

function profile(access_token) {
  var url = "https://api.spotify.com/v1/me"
  
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Authorization", "Bearer " + access_token)

  xhr.onreadystatechange = () => {
    // Call a function when the state changes.
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      console.log(xhr.response)
      var json = JSON.parse(xhr.response)
      var username = json.display_name;
      var user_plan = json.product;
      var user_email = json.email;
      try {
        var user_avatar = json.images[1].url;
        document.getElementById("userAvatar").innerHTML = "<img src=\"" + user_avatar + "\" width=\"50rem\" height=\"50rem\" id=\"header-card-avatar\"/> <div class=\"titleName\"><h5 class=\"card-title\">Account</h5> <p id=\"name\"></p></div>";
      } catch (e) {
        document.getElementById("userAvatar").innerHTML = "<img src=\"../img/unknown.jpg\" width=\"50rem\" height=\"50rem\" id=\"header-card-avatar\"/> <div class=\"titleName\"><h5 class=\"card-title\">Account</h5> <p id=\"name\"></p></div>";
      }  
      document.getElementById("name").innerText = username;
      document.getElementById("userPlan").innerHTML = "<b>Plan: </b>" + user_plan;
      document.getElementById("userEmail").innerHTML = "<b>Email: </b>" + user_email;
    }
  };
  xhr.send();
}



function search_artist() {
  var table = document.getElementById('tableArtist');
  let input = document.getElementById("searchBar").value;
  try {
    for (var r = 0, n = table.rows.length; r < n; r++) {
      for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
        if (input.toLocaleLowerCase().includes(table.rows[r].cells[1].innerText.toLocaleLowerCase())) {
          document.getElementById('tableArtist').getElementsByTagName('tbody')[0].innerHTML = table.rows[r].innerHTML;
          followedArtist(access_token);
        } else if (input === "") {
          document.getElementById('tableArtist').getElementsByTagName('tbody')[0].innerHTML = ""
        } else {
          console.log("No match.");
        }
      }
    }
  } catch (e) {
      if (e instanceof TypeError) {
        console.log("Table already empty !")
        followedArtist(localStorage.getItem("access_token"));
    }
  }
}
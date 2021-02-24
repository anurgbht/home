function GetURLParameter()
{
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  const name = urlParams.get("name")
  console.log(name);
  
}​
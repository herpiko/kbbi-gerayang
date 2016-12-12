var fetch = function(char) {
	var words = []
 	var x = $('.row')[1].children;
  for (var i in x) {
    if (x[i].innerHTML) {
      var y = x[i].innerHTML.split('href="')[1].split('">')[0]
      if (y) {
        words.push(y.split('/')[2])
      }
    }
  }
  $.get('http://localhost:3000/' + char + '/' + encodeURIComponent(words.join(',')), function(){
  	$('[title="Ke halaman berikutnya"]')[0].click()
  })
}
fetch('A');

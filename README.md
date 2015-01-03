kbbi-gerayang
=============

a simple KBBI.web.id crawler using squenced permutation algorithm.

####requirement
- node
- npm
- mongodb

####usage
```$ npm install -d```

```$ node --stack-size=1000000 gerayang.js 1 100```
means gerayang will crawling with 1 character permutation in 100 attempts

####todo

in the lema directory, there is an impressive script written by @diorahman for fetching word list from badanbahasa.kemdikbud.go.id/index.php which totalled 36059 words. still less than official KBBI's (arund 70000 words) but more than Kateglo's (around 28000 words).

it means there is no need for permutation anymore. gerayang should use these word list instead of perform a loooooong and unexpected permutation.

# English Stemmer - Porter's Algorithm

This code is based on Martin Porter's stemming algorithm.

Here you can find the original paper on http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.848.7219&rep=rep1&type=pdf

And also there is plain text version: https://tartarus.org/martin/PorterStemmer/def.txt

The main web page of the algorithm: https://tartarus.org/martin/PorterStemmer/

There are two changes in the main algorithm as described in the above page since 1980. They are also included in the code base too.

Code is tested with the official vocabulary and output txt files.

[Sample vocabulary](https://tartarus.org/martin/PorterStemmer/voc.txt)

[Output](https://tartarus.org/martin/PorterStemmer/output.txt)

### Example Usage

Install the library

```npm
npm i porter-stemmer-english
```

Call stemmer

```code
const stemmer = require("porter-stemmer-english") 
stemmer("possibly") //returns possibli
```

# Inside a Neural Network

Seven interactive chapters that build up a neural network from a single neuron, getting a little more complex each time. Every network trains live in the browser. It's one HTML file with plain JavaScript and canvas, no libraries and no build step.

**Live site:** https://milandahal213.github.io/FunStuff/neural/

## Chapters

| # | Chapter | What you can do |
| --- | --- | --- |
| 1 | One neuron | Change the input, weight, bias and activation, and watch the output and its curve |
| 2 | A neuron draws a line | Turn and slide a neuron's decision line by hand to sort two kinds of dots |
| 3 | How it learns | Watch gradient descent roll down the error surface; change the learning rate, drop the start point anywhere, add dots |
| 4 | One line isn't enough | Add hidden neurons to solve XOR and the circle; see what each neuron responds to |
| 5 | Building any curve | Fit a curve out of ReLU pieces, or draw your own target |
| 6 | The playground | Choose data, layers, width, activation, learning rate and extra inputs; compare training and test error |
| 7 | How networks see | Paint an image, edit a 3×3 filter, and watch the feature map, ReLU and max pooling |

## How it works

A small multilayer network class does the forward pass, backpropagation and Adam updates. Chapter 3 uses plain gradient descent on a single neuron, so the path on the error surface is exactly the one the math takes.

## Run locally

Open `index.html` in a browser. No server is needed.

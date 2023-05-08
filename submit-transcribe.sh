#!/bin/bash

for i in {1..2}
do
  nohup npm run exec data/xxxx  us-east-1 &
done
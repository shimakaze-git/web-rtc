FROM node:alpine

# # node.js の環境変数を定義する
# # 本番環境では production
# ENV NODE_ENV=development

# ワーキングディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストールする
# package-lock.jsonもコピーするために*（ワイルドカード）を使用しています
# COPY package.json ./
# COPY yarn.lock ./
# RUN npm install

# apkはalpineのパッケージマネージャ
RUN apk update && \
    apk add --no-cache git curl && \
    curl -o- -L https://yarnpkg.com/install.sh | sh

ENV PATH $HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH

# アプリケーションのソースをバンドルする
COPY . .

# アプリケーションの依存関係をインストールする
# COPY package.json ./
# COPY yarn.lock ./
RUN yarn install
RUN yarn global add supervisor

# 3000番ポートを開ける
EXPOSE 3000

# アプリケーションを起動
# CMD [ "yarn", "start"]
CMD supervisor -i node_modules ./bin/www

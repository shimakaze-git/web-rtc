FROM  nginx:stable
MAINTAINER shimakaze-git

# ADD default.conf /etc/nginx/conf.d
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d

RUN echo 'now building...'

# Install Supervisor and config
RUN apt-get update
# RUN apt-get install -y curl

# RUN apk update && \
#     apk add --no-cache supervisor

# RUN apt install supervisor
RUN apt-get install -y supervisor
# RUN touch /etc/supervisord.conf

# RUN echo '[supervisord]'  >> /etc/supervisord.conf
# RUN echo 'nodaemon=true'  >> /etc/supervisord.conf
# RUN echo 'logfile=/var/log/supervisor/supervisord.log'  >> /etc/supervisord.conf
# RUN echo '[program:nginx]' >> /etc/supervisord.conf
# RUN echo 'command=nginx'   >> /etc/supervisord.conf

EXPOSE 80
CMD /usr/bin/supervisord -c /etc/supervisord.conf

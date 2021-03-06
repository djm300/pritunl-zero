package mhandlers

import (
	"github.com/dropbox/godropbox/container/set"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-zero/database"
	"github.com/pritunl/pritunl-zero/demo"
	"github.com/pritunl/pritunl-zero/event"
	"github.com/pritunl/pritunl-zero/settings"
	"github.com/pritunl/pritunl-zero/utils"
	"gopkg.in/mgo.v2/bson"
)

type settingsData struct {
	AuthProviders        []*settings.Provider `json:"auth_providers"`
	AuthExpire           int                  `json:"auth_expire"`
	AuthMaxDuration      int                  `json:"auth_max_duration"`
	ElasticAddress       string               `json:"elastic_address"`
	ElasticProxyRequests bool                 `json:"elastic_proxy_requests"`
}

func getSettingsData() *settingsData {
	data := &settingsData{
		AuthProviders:        settings.Auth.Providers,
		AuthExpire:           settings.Auth.Expire,
		AuthMaxDuration:      settings.Auth.MaxDuration,
		ElasticProxyRequests: settings.Elastic.ProxyRequests,
	}

	if len(settings.Elastic.Addresses) != 0 {
		data.ElasticAddress = settings.Elastic.Addresses[0]
	}

	return data
}

func settingsGet(c *gin.Context) {
	data := getSettingsData()
	c.JSON(200, data)
}

func settingsPut(c *gin.Context) {
	if demo.Blocked(c) {
		return
	}

	db := c.MustGet("db").(*database.Database)
	data := &settingsData{}

	err := c.Bind(data)
	if err != nil {
		utils.AbortWithError(c, 500, err)
		return
	}

	fields := set.NewSet()

	elasticAddr := ""
	if len(settings.Elastic.Addresses) != 0 {
		elasticAddr = settings.Elastic.Addresses[0]
	}

	if elasticAddr != data.ElasticAddress {
		if data.ElasticAddress == "" {
			settings.Elastic.Addresses = []string{}
		} else {
			settings.Elastic.Addresses = []string{
				data.ElasticAddress,
			}
		}
		fields.Add("addresses")
	}

	if settings.Elastic.ProxyRequests != data.ElasticProxyRequests {
		settings.Elastic.ProxyRequests = data.ElasticProxyRequests
		fields.Add("proxy_requests")
	}

	if fields.Len() != 0 {
		err = settings.Commit(db, settings.Elastic, fields)
		if err != nil {
			utils.AbortWithError(c, 500, err)
			return
		}
	}

	fields = set.NewSet(
		"providers",
	)

	if settings.Auth.Expire != data.AuthExpire {
		settings.Auth.Expire = data.AuthExpire
		fields.Add("expire")
	}

	if settings.Auth.MaxDuration != data.AuthMaxDuration {
		settings.Auth.MaxDuration = data.AuthMaxDuration
		fields.Add("max_duration")
	}

	for _, provider := range data.AuthProviders {
		if provider.Id == "" {
			provider.Id = bson.NewObjectId()
		}
	}

	settings.Auth.Providers = data.AuthProviders
	err = settings.Commit(db, settings.Auth, fields)
	if err != nil {
		utils.AbortWithError(c, 500, err)
		return
	}

	event.PublishDispatch(db, "settings.change")

	data = getSettingsData()
	c.JSON(200, data)
}

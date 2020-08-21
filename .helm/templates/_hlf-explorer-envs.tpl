{{- define "hlf-explorer-envs" }}
- name: POSTGRES_DB_HOST
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.host | first | default .Values.postgres_gcp.host._default }}"

- name: POSTGRES_DB
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.db | first | default .Values.postgres_gcp.db._default }}"

- name: POSTGRES_USER
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.user | first | default .Values.postgres_gcp.user._default }}"

- name: POSTGRES_PASSWORD
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.password | first | default .Values.postgres_gcp.password._default }}"

- name: POSTGRES_DB_PORT
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.port | first | default .Values.postgres_gcp.port._default }}"

- name: FABRIC_IDENTITY
  value: "user1"
- name: FABRIC_IDENTITY_MSP_ID
  value: "Org1MSP"
- name: FABRIC_IS_DISCOVERY_ENABLED
  value: false
- name: FABRIC_CHAINCODE_NAME
  value: "main"
- name: FABRIC_NETWORK_NAME
  value: "mychannel"
- name: FABRIC_CONNECTION_SETTINGS_PATH
  value: "src/connection.json"
{{- end }}

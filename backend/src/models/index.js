/**
 * In-Memory Database Models
 * 실제로는 PostgreSQL/MongoDB를 사용하지만,
 * 간단한 구현을 위해 메모리 기반으로 시작
 */

// 운영자 데이터
const operators = new Map();

// 서비스 데이터
const services = new Map();

// API 키 데이터
const apiKeys = new Map();

// 사용자 데이터 (최종 사용자)
const endUsers = new Map();

class Operator {
  constructor(data) {
    this.id = data.id || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.passwordNonce = data.passwordNonce;
    this.did = data.did;
    this.name = data.name;
    this.company = data.company;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  static create(data) {
    const operator = new Operator(data);
    operators.set(operator.id, operator);
    return operator;
  }

  static findById(id) {
    return operators.get(id);
  }

  static findByEmail(email) {
    for (const [id, operator] of operators) {
      if (operator.email === email) {
        return operator;
      }
    }
    return null;
  }

  static findByDID(did) {
    for (const [id, operator] of operators) {
      if (operator.did === did) {
        return operator;
      }
    }
    return null;
  }

  static getAll() {
    return Array.from(operators.values());
  }

  update(data) {
    Object.assign(this, data);
    this.updatedAt = Date.now();
    operators.set(this.id, this);
    return this;
  }

  delete() {
    operators.delete(this.id);
  }
}

class Service {
  constructor(data) {
    this.id = data.id || `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.operatorId = data.operatorId;
    this.name = data.name;
    this.url = data.url;
    this.description = data.description;
    this.apiKey = data.apiKey;
    this.apiSecret = data.apiSecret;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.plan = data.plan || 'free'; // free, basic, pro, enterprise
    this.usageLimit = data.usageLimit || 100000; // 월 로그인 횟수 제한
    this.currentUsage = data.currentUsage || 0;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static create(data) {
    const service = new Service(data);
    services.set(service.id, service);

    // API 키도 별도로 저장
    if (service.apiKey) {
      apiKeys.set(service.apiKey, service.id);
    }

    return service;
  }

  static findById(id) {
    return services.get(id);
  }

  static findByApiKey(apiKey) {
    const serviceId = apiKeys.get(apiKey);
    return serviceId ? services.get(serviceId) : null;
  }

  static findByOperator(operatorId) {
    const operatorServices = [];
    for (const [id, service] of services) {
      if (service.operatorId === operatorId) {
        operatorServices.push(service);
      }
    }
    return operatorServices;
  }

  static getAll() {
    return Array.from(services.values());
  }

  update(data) {
    Object.assign(this, data);
    this.updatedAt = Date.now();
    services.set(this.id, this);
    return this;
  }

  incrementUsage() {
    this.currentUsage++;
    this.updatedAt = Date.now();
    services.set(this.id, this);
  }

  resetUsage() {
    this.currentUsage = 0;
    this.updatedAt = Date.now();
    services.set(this.id, this);
  }

  delete() {
    if (this.apiKey) {
      apiKeys.delete(this.apiKey);
    }
    services.delete(this.id);
  }
}

class EndUser {
  constructor(data) {
    this.id = data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.serviceId = data.serviceId;
    this.userId = data.userId; // 서비스 내 사용자 ID
    this.did = data.did;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.passwordNonce = data.passwordNonce;
    this.deviceHash = data.deviceHash;
    this.createdAt = data.createdAt || Date.now();
    this.lastLoginAt = data.lastLoginAt || null;
    this.loginCount = data.loginCount || 0;
  }

  static create(data) {
    const user = new EndUser(data);
    const key = `${user.serviceId}:${user.userId}`;
    endUsers.set(key, user);
    return user;
  }

  static findByServiceAndUserId(serviceId, userId) {
    const key = `${serviceId}:${userId}`;
    return endUsers.get(key);
  }

  static findByDID(did) {
    for (const [key, user] of endUsers) {
      if (user.did === did) {
        return user;
      }
    }
    return null;
  }

  update(data) {
    Object.assign(this, data);
    const key = `${this.serviceId}:${this.userId}`;
    endUsers.set(key, this);
    return this;
  }

  incrementLoginCount() {
    this.loginCount++;
    this.lastLoginAt = Date.now();
    const key = `${this.serviceId}:${this.userId}`;
    endUsers.set(key, this);
  }
}

module.exports = {
  Operator,
  Service,
  EndUser,
  // 직접 접근용 (테스트/관리)
  _operators: operators,
  _services: services,
  _apiKeys: apiKeys,
  _endUsers: endUsers
};

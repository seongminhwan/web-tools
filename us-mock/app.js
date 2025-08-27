// 美国地址生成工具 - 完整多Tab版

class AddressGeneratorApp {
    constructor() {
        this.tabs = ['tab1', 'tab2', 'tab3'];
        this.currentTab = 'tab1';
        this.tabCounter = 3;
        this.tabData = {};
        this.tabNames = {
            'tab1': '数据组 1',
            'tab2': '数据组 2',
            'tab3': '数据组 3'
        };

        // 初始化每个Tab的数据
        this.tabs.forEach(tabId => {
            this.tabData[tabId] = { address: null, user: null };
        });

        this.init();
    }

    init() {
        this.loadStoredLayout();
        this.loadStoredData();

        // 确保DOM完全加载后再初始化Tab
        setTimeout(() => {
            this.initTabs();
            this.updateTabTitles();
            this.initCollapsiblePanels();
            this.populateAllStateDropdowns();
            this.bindEvents();
        }, 100);
    }

    // 初始化所有Tab
    initTabs() {
        // 创建Tab2和Tab3的内容
        this.createTabContent('tab2');
        this.createTabContent('tab3');

        // 使用更延迟的绑定确保DOM完全准备好
        setTimeout(() => {
            this.bindTabButtonEvents();
        }, 200);
    }

    // 绑定Tab按钮事件
    bindTabButtonEvents() {
        const tabButtons = document.querySelectorAll('.tab-btn:not(.add-tab)');
        console.log('找到Tab按钮数量:', tabButtons.length);

        tabButtons.forEach(btn => {
            console.log('绑定事件到Tab:', btn.getAttribute('data-tab'));

            // 绑定Tab切换事件
            btn.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                console.log('Tab clicked:', tabId);
                this.switchTab(tabId);
            });

            // 绑定双击事件来修改Tab名称
            btn.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Double click detected on tab:', e.target.getAttribute('data-tab'));
                const tabId = e.target.getAttribute('data-tab');
                this.editTabName(e.target, tabId);
            });

            // 绑定右键菜单事件
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Right click detected on tab:', e.target.getAttribute('data-tab'));
                const tabId = e.target.getAttribute('data-tab');
                this.showTabContextMenu(e, e.target, tabId);
            });
        });

        // 绑定新增Tab事件
        document.getElementById('addTab').addEventListener('click', () => {
            this.addNewTab();
        });
    }

    // 创建Tab内容
    createTabContent(tabId) {
        const tabPanel = document.getElementById(tabId);

        if (tabPanel) {
            // 检查是否为空或只包含注释和空白
            const hasRealContent = tabPanel.querySelector('.main-content') !== null;

            if (!hasRealContent) {
                // 获取tab1的内容作为模板
                const tab1Panel = document.getElementById('tab1');
                if (tab1Panel) {
                    console.log(`Creating content for ${tabId}`);
                    tabPanel.innerHTML = tab1Panel.innerHTML;

                    // 更新所有ID
                    this.updateTabIds(tabPanel, tabId);

                    // 绑定该Tab的事件
                    this.bindTabEvents(tabId);

                    // 初始化该Tab的州选择器
                    this.populateStateDropdown(tabId);

                    console.log(`Successfully created ${tabId}`);
                } else {
                    console.log(`Tab1 content not ready for ${tabId}`);
                }
            } else {
                console.log(`Tab panel ${tabId} already has content`);
            }
        } else {
            console.log(`Tab panel ${tabId} doesn't exist`);
        }
    }

    // 更新Tab内的所有ID
    updateTabIds(panel, tabId) {
        const elements = panel.querySelectorAll('[id]');
        elements.forEach(el => {
            const oldId = el.id;
            el.id = oldId.replace(/tab\d+/, tabId);
        });

        // 更新data-target属性
        const collapsibleHeaders = panel.querySelectorAll('[data-target]');
        collapsibleHeaders.forEach(header => {
            const oldTarget = header.getAttribute('data-target');
            header.setAttribute('data-target', oldTarget.replace(/tab\d+/, tabId));
        });

        // 更新data-tab属性
        const copyBtns = panel.querySelectorAll('[data-tab]');
        copyBtns.forEach(btn => {
            btn.setAttribute('data-tab', tabId);
        });
    }

    // 切换Tab
    switchTab(tabId) {
        // 保存当前Tab数据
        this.saveCurrentTabData();

        // 更新UI
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;

        // 加载新Tab数据
        this.loadTabData(tabId);

        // 确保布局一致
        this.syncLayout(tabId);
    }

    // 同步所有Tab的布局
    syncLayout(tabId) {
        const currentLayout = document.getElementById('mainContent-tab1').classList.contains('horizontal') ? 'horizontal' : 'vertical';
        const targetMainContent = document.getElementById(`mainContent-${tabId}`);
        if (targetMainContent) {
            targetMainContent.classList.remove('horizontal', 'vertical');
            targetMainContent.classList.add(currentLayout);
        }
    }

    // 添加新Tab
    addNewTab() {
        this.tabCounter++;
        const newTabId = `tab${this.tabCounter}`;
        this.tabs.push(newTabId);
        this.tabData[newTabId] = { address: null, user: null };

        // 创建Tab按钮
        const tabNav = document.querySelector('.tab-nav');
        const addTabBtn = document.getElementById('addTab');

        const newTabBtn = document.createElement('button');
        newTabBtn.className = 'tab-btn';
        newTabBtn.setAttribute('data-tab', newTabId);

        const newTabName = `数据组 ${this.tabCounter}`;
        newTabBtn.textContent = newTabName;
        this.tabNames[newTabId] = newTabName;

        newTabBtn.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('data-tab');
            this.switchTab(tabId);
        });

        // 为新Tab添加双击事件
        newTabBtn.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const tabId = e.target.getAttribute('data-tab');
            this.editTabName(e.target, tabId);
        });

        // 为新Tab添加右键菜单
        newTabBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const tabId = e.target.getAttribute('data-tab');
            this.showTabContextMenu(e, e.target, tabId);
        });

        tabNav.insertBefore(newTabBtn, addTabBtn);

        // 创建Tab内容
        const tabContent = document.getElementById('tabContent');
        const newTabPanel = document.createElement('div');
        newTabPanel.className = 'tab-panel';
        newTabPanel.id = newTabId;

        tabContent.appendChild(newTabPanel);

        // 创建内容并切换
        this.createTabContent(newTabId);
        this.switchTab(newTabId);

        this.showToast(`已添加${newTabName}`);
    }

    // 显示Tab右键菜单
    showTabContextMenu(e, tabBtn, tabId) {
        // 移除现有的右键菜单
        const existingMenu = document.getElementById('tabContextMenu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // 创建右键菜单
        const menu = document.createElement('div');
        menu.id = 'tabContextMenu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            padding: 8px 0;
            min-width: 120px;
        `;

        // 创建菜单项
        const renameItem = document.createElement('div');
        renameItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 14px;
            color: #333;
        `;
        renameItem.textContent = '重命名';
        renameItem.onmouseover = () => renameItem.style.background = 'rgba(52, 152, 219, 0.1)';
        renameItem.onmouseout = () => renameItem.style.background = 'transparent';
        renameItem.onclick = () => {
            menu.remove();
            this.editTabName(tabBtn, tabId);
        };

        menu.appendChild(renameItem);
        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        const closeMenu = (event) => {
            if (!menu.contains(event.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    // 编辑Tab名称
    editTabName(tabBtn, tabId) {
        console.log('Editing tab name for:', tabId);
        const currentName = this.tabNames[tabId] || tabBtn.textContent;

        // 防止重复编辑
        if (tabBtn.querySelector('input')) {
            return;
        }

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'tab-name-editor';
        input.maxLength = 20;
        input.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #3498db;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 14px;
            width: 80px;
            text-align: center;
            box-sizing: border-box;
        `;

        // 保存原始内容并替换
        const originalText = tabBtn.textContent;
        tabBtn.innerHTML = '';
        tabBtn.appendChild(input);

        // 选中输入框内容
        setTimeout(() => {
            input.select();
            input.focus();
        }, 10);

        // 保存函数
        const saveTabName = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName && newName.length <= 20) {
                this.tabNames[tabId] = newName;
                tabBtn.innerHTML = newName;
                this.saveToStorage();
                this.showToast(`Tab名称已更新为: ${newName}`);
            } else {
                tabBtn.innerHTML = originalText;
                if (newName.length > 20) {
                    this.showToast('Tab名称不能超过20个字符', 'error');
                }
            }
        };

        // 取消函数
        const cancelEdit = () => {
            tabBtn.innerHTML = originalText;
        };

        // 绑定事件
        input.addEventListener('blur', saveTabName);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveTabName();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });

        // 防止输入框本身触发Tab切换
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // 初始化折叠面板
    initCollapsiblePanels() {
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const target = header.getAttribute('data-target');
                const content = document.getElementById(target);

                if (content) {
                    const isActive = content.classList.contains('active');

                    if (isActive) {
                        content.classList.remove('active');
                        header.classList.remove('active');
                    } else {
                        content.classList.add('active');
                        header.classList.add('active');
                    }
                }
            });
        });
    }

    // 填充所有州选择器
    populateAllStateDropdowns() {
        this.tabs.forEach(tabId => {
            this.populateStateDropdown(tabId);
        });
    }

    // 填充单个Tab的州选择器
    populateStateDropdown(tabId) {
        const stateSelect = document.getElementById(`stateSelect-${tabId}`);
        if (stateSelect) {
            stateSelect.innerHTML = '<option value="">随机选择...</option>';

            Object.keys(AddressGenerator.US_STATES_DATA).forEach(stateCode => {
                const stateData = AddressGenerator.US_STATES_DATA[stateCode];
                const option = document.createElement('option');
                option.value = stateCode;
                option.textContent = `${stateData.name}`;
                stateSelect.appendChild(option);
            });
        }
    }

    // 更新城市选择器
    updateCityDropdown(stateCode, tabId) {
        const citySelect = document.getElementById(`citySelect-${tabId}`);
        if (!citySelect) return;

        citySelect.innerHTML = '<option value="">随机选择...</option>';

        if (stateCode && AddressGenerator.US_STATES_DATA[stateCode]) {
            const cities = AddressGenerator.US_STATES_DATA[stateCode].cities;
            citySelect.disabled = false;

            Object.keys(cities).forEach(cityName => {
                const option = document.createElement('option');
                option.value = cityName;
                option.textContent = cityName;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = false;
        }
    }

    // 生成地址
    generateAddress(tabId) {
        const stateSelect = document.getElementById(`stateSelect-${tabId}`);
        const citySelect = document.getElementById(`citySelect-${tabId}`);

        const selectedState = stateSelect ? stateSelect.value : '';
        const selectedCity = citySelect ? citySelect.value : '';

        let finalState, finalCity, zipCode;

        if (selectedState) {
            finalState = selectedState;
            const stateData = AddressGenerator.US_STATES_DATA[selectedState];

            if (selectedCity && stateData.cities[selectedCity]) {
                finalCity = selectedCity;
                zipCode = AddressGenerator.getRandomElement(stateData.cities[selectedCity]);
            } else {
                const cities = Object.keys(stateData.cities);
                finalCity = AddressGenerator.getRandomElement(cities);
                zipCode = AddressGenerator.getRandomElement(stateData.cities[finalCity]);
            }
        } else {
            const states = Object.keys(AddressGenerator.US_STATES_DATA);
            finalState = AddressGenerator.getRandomElement(states);
            const stateData = AddressGenerator.US_STATES_DATA[finalState];
            const cities = Object.keys(stateData.cities);
            finalCity = AddressGenerator.getRandomElement(cities);
            zipCode = AddressGenerator.getRandomElement(stateData.cities[finalCity]);
        }

        const street1 = AddressGenerator.generateStreetAddress();
        const street2 = AddressGenerator.generateApartment();

        this.tabData[tabId].address = {
            street1,
            street2,
            city: finalCity,
            state: AddressGenerator.US_STATES_DATA[finalState].name,
            zipCode
        };

        this.displayAddress(tabId);
        this.saveToStorage();
    }

    // 生成用户信息
    generateUser(tabId) {
        const genderPreferSelect = document.getElementById(`genderPrefer-${tabId}`);
        const ageRangeSelect = document.getElementById(`ageRange-${tabId}`);
        const nameStyleSelect = document.getElementById(`nameStyle-${tabId}`);

        const genderPrefer = genderPreferSelect ? genderPreferSelect.value : 'random';
        const ageRange = ageRangeSelect ? ageRangeSelect.value : '18-80';
        const nameStyle = nameStyleSelect ? nameStyleSelect.value : 'mixed';

        let gender;
        if (genderPrefer === 'random') {
            gender = AddressGenerator.getRandomElement(['Male', 'Female']);
        } else {
            gender = genderPrefer;
        }

        const nameData = AddressGenerator.generateName(gender, nameStyle);
        const birthDate = AddressGenerator.generateBirthDate(ageRange);

        this.tabData[tabId].user = {
            firstName: nameData.firstName,
            lastName: nameData.lastName,
            birthYear: birthDate.year,
            birthMonth: birthDate.month,
            birthDay: birthDate.day,
            gender
        };

        this.displayUser(tabId);
        this.saveToStorage();
    }

    // 同时生成地址和用户
    generateAll(tabId) {
        this.generateAddress(tabId);
        this.generateUser(tabId);
        this.showToast(`数据组 ${tabId.replace('tab', '')} 已生成完成`);
    }

    // 显示地址
    displayAddress(tabId) {
        const address = this.tabData[tabId].address;

        const fields = ['street1', 'street2', 'city', 'state', 'zipCode'];
        fields.forEach(field => {
            const element = document.getElementById(`${field}-${tabId}`);
            if (element) {
                if (address && address[field]) {
                    element.textContent = field === 'street2' && !address[field] ? '-' : address[field];
                } else {
                    element.textContent = '-';
                }
            }
        });
    }

    // 显示用户信息
    displayUser(tabId) {
        const user = this.tabData[tabId].user;

        const fields = ['firstName', 'lastName', 'birthYear', 'birthMonth', 'birthDay', 'gender'];
        fields.forEach(field => {
            const element = document.getElementById(`${field}-${tabId}`);
            if (element) {
                if (user && user[field]) {
                    element.textContent = user[field];
                } else {
                    element.textContent = '-';
                }
            }
        });
    }

    // 复制功能
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }

    // 复制单个字段
    async copyField(fieldName, tabId) {
        const element = document.getElementById(`${fieldName}-${tabId}`);
        if (!element || element.textContent === '-') {
            this.showToast('没有内容可复制', 'error');
            return;
        }

        const success = await this.copyToClipboard(element.textContent);
        if (success) {
            this.showToast(`已复制: ${element.textContent}`);
            this.animateCopyButton(fieldName, tabId);
        } else {
            this.showToast('复制失败', 'error');
        }
    }

    // 复制地址JSON
    async copyAddressJson(tabId) {
        const address = this.tabData[tabId].address;
        if (!address) {
            this.showToast('请先生成地址', 'error');
            return;
        }

        const json = JSON.stringify(address, null, 2);
        const success = await this.copyToClipboard(json);

        if (success) {
            this.showToast('地址JSON已复制');
        } else {
            this.showToast('复制失败', 'error');
        }
    }

    // 复制用户JSON
    async copyUserJson(tabId) {
        const user = this.tabData[tabId].user;
        if (!user) {
            this.showToast('请先生成用户信息', 'error');
            return;
        }

        const json = JSON.stringify(user, null, 2);
        const success = await this.copyToClipboard(json);

        if (success) {
            this.showToast('用户信息JSON已复制');
        } else {
            this.showToast('复制失败', 'error');
        }
    }

    // 复制全部信息
    async copyAllJson(tabId) {
        const data = this.tabData[tabId];
        if (!data.address && !data.user) {
            this.showToast('请先生成地址和用户信息', 'error');
            return;
        }

        const allData = {
            timestamp: new Date().toISOString(),
            tabId: tabId,
            address: data.address || null,
            user: data.user || null
        };

        const json = JSON.stringify(allData, null, 2);
        const success = await this.copyToClipboard(json);

        if (success) {
            this.showToast('全部信息JSON已复制');
        } else {
            this.showToast('复制失败', 'error');
        }
    }

    // 清空Tab数据
    clearAll(tabId) {
        this.tabData[tabId] = { address: null, user: null };
        this.displayAddress(tabId);
        this.displayUser(tabId);

        // 重置表单
        const stateSelect = document.getElementById(`stateSelect-${tabId}`);
        const citySelect = document.getElementById(`citySelect-${tabId}`);
        const genderPreferSelect = document.getElementById(`genderPrefer-${tabId}`);
        const ageRangeSelect = document.getElementById(`ageRange-${tabId}`);
        const nameStyleSelect = document.getElementById(`nameStyle-${tabId}`);

        if (stateSelect) stateSelect.value = '';
        if (citySelect) citySelect.innerHTML = '<option value="">随机选择...</option>';
        if (genderPreferSelect) genderPreferSelect.value = 'random';
        if (ageRangeSelect) ageRangeSelect.value = '18-80';
        if (nameStyleSelect) nameStyleSelect.value = 'mixed';

        this.saveToStorage();
        this.showToast(`数据组 ${tabId.replace('tab', '')} 已清空`);
    }

    // 动画效果
    animateCopyButton(fieldName, tabId) {
        const button = document.querySelector(`[data-field="${fieldName}"][data-tab="${tabId}"]`);
        if (button) {
            button.classList.add('copied');
            setTimeout(() => {
                button.classList.remove('copied');
            }, 1000);
        }
    }

    // 切换布局
    toggleLayout() {
        const mainContents = document.querySelectorAll('[id^="mainContent-"]');
        const currentLayout = document.getElementById('mainContent-tab1').classList.contains('horizontal') ? 'horizontal' : 'vertical';
        const newLayout = currentLayout === 'horizontal' ? 'vertical' : 'horizontal';

        mainContents.forEach(mainContent => {
            mainContent.classList.remove('horizontal', 'vertical');
            mainContent.classList.add(newLayout);
        });

        localStorage.setItem('preferredLayout', newLayout);
        this.showToast(`已切换为${newLayout === 'horizontal' ? '左右' : '上下'}布局`);
    }

    // 显示提示消息
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');

        toastMessage.textContent = message;

        if (type === 'error') {
            toast.style.background = '#e74c3c';
            icon.className = 'fas fa-exclamation-circle';
        } else {
            toast.style.background = '#2ecc71';
            icon.className = 'fas fa-check-circle';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 保存当前Tab数据
    saveCurrentTabData() {
        // 数据已经在生成时保存，这里不需要额外操作
    }

    // 加载Tab数据
    loadTabData(tabId) {
        this.displayAddress(tabId);
        this.displayUser(tabId);
    }

    // 保存到存储
    saveToStorage() {
        const data = {
            tabData: this.tabData,
            currentTab: this.currentTab,
            tabs: this.tabs,
            tabCounter: this.tabCounter,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('addressGeneratorData', JSON.stringify(data));
        } catch (e) {
            console.error('保存数据失败:', e);
        }
    }

    // 从存储加载数据
    loadStoredData() {
        try {
            const stored = localStorage.getItem('addressGeneratorData');
            if (stored) {
                const data = JSON.parse(stored);
                this.tabData = data.tabData || this.tabData;
                this.currentTab = data.currentTab || this.currentTab;
                this.tabs = data.tabs || this.tabs;
                this.tabCounter = data.tabCounter || this.tabCounter;
                this.tabNames = data.tabNames || this.tabNames;
            }
        } catch (e) {
            console.error('加载数据失败:', e);
        }
    }

    // 加载布局偏好
    loadStoredLayout() {
        const storedLayout = localStorage.getItem('preferredLayout') || 'horizontal';
        // 布局将在Tab创建后应用
    }

    // 绑定Tab特定事件
    bindTabEvents(tabId) {
        // 州选择改变
        const stateSelect = document.getElementById(`stateSelect-${tabId}`);
        if (stateSelect) {
            stateSelect.addEventListener('change', (e) => {
                this.updateCityDropdown(e.target.value, tabId);
            });
        }

        // 生成按钮
        const generateAddress = document.getElementById(`generateAddress-${tabId}`);
        if (generateAddress) {
            generateAddress.addEventListener('click', () => {
                this.generateAddress(tabId);
            });
        }

        const generateUser = document.getElementById(`generateUser-${tabId}`);
        if (generateUser) {
            generateUser.addEventListener('click', () => {
                this.generateUser(tabId);
            });
        }

        const generateAll = document.getElementById(`generateAll-${tabId}`);
        if (generateAll) {
            generateAll.addEventListener('click', () => {
                this.generateAll(tabId);
            });
        }

        // JSON复制按钮
        const copyAddressJson = document.getElementById(`copyAddressJson-${tabId}`);
        if (copyAddressJson) {
            copyAddressJson.addEventListener('click', () => {
                this.copyAddressJson(tabId);
            });
        }

        const copyUserJson = document.getElementById(`copyUserJson-${tabId}`);
        if (copyUserJson) {
            copyUserJson.addEventListener('click', () => {
                this.copyUserJson(tabId);
            });
        }

        const copyAll = document.getElementById(`copyAll-${tabId}`);
        if (copyAll) {
            copyAll.addEventListener('click', () => {
                this.copyAllJson(tabId);
            });
        }

        const clearAll = document.getElementById(`clearAll-${tabId}`);
        if (clearAll) {
            clearAll.addEventListener('click', () => {
                if (confirm('确定要清空当前数据组的数据吗？')) {
                    this.clearAll(tabId);
                }
            });
        }

        // 单字段复制按钮
        const copyBtns = document.querySelectorAll(`[data-tab="${tabId}"].copy-btn`);
        copyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldName = e.currentTarget.getAttribute('data-field');
                this.copyField(fieldName, tabId);
            });
        });

        // 折叠面板
        const collapsibleHeaders = document.querySelectorAll(`[data-target*="${tabId}"]`);
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const target = header.getAttribute('data-target');
                const content = document.getElementById(target);

                if (content) {
                    const isActive = content.classList.contains('active');

                    if (isActive) {
                        content.classList.remove('active');
                        header.classList.remove('active');
                    } else {
                        content.classList.add('active');
                        header.classList.add('active');
                    }
                }
            });
        });
    }

    // 绑定全局事件
    bindEvents() {
        // 绑定Tab1的事件（默认存在）
        this.bindTabEvents('tab1');

        // 布局切换
        const layoutToggle = document.getElementById('layoutToggle');
        if (layoutToggle) {
            layoutToggle.addEventListener('click', () => {
                this.toggleLayout();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generateAll(this.currentTab);
                        break;
                    case 'l':
                        e.preventDefault();
                        this.toggleLayout();
                        break;
                }
            }
        });

        // 页面加载完成后应用布局
        setTimeout(() => {
            const storedLayout = localStorage.getItem('preferredLayout') || 'horizontal';
            const mainContents = document.querySelectorAll('[id^="mainContent-"]');
            mainContents.forEach(mainContent => {
                mainContent.classList.remove('horizontal', 'vertical');
                mainContent.classList.add(storedLayout);
            });
        }, 100);
    }

    // 更新Tab标题显示
    updateTabTitles() {
        Object.keys(this.tabNames).forEach(tabId => {
            const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
            if (tabBtn && !tabBtn.classList.contains('add-tab')) {
                tabBtn.textContent = this.tabNames[tabId];
            }
        });
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AddressGeneratorApp();
});